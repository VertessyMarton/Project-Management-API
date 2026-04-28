import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Otp } from './entities/otp.entity';
import { MoreThan, Repository } from 'typeorm';
import * as crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { OtpEnum } from './enums/otp.enum';
import { User } from 'src/user/entities/user.entity';
import { verificationEmailTemplate } from 'src/email/templates/verification-email.template';
import { EmailService } from 'src/email/email.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
    private emailService: EmailService,
  ) {}

  async generateOtp(user: User, type: OtpEnum): Promise<string> {
    const otp = crypto.randomInt(100000, 999999).toString();
    const token = await bcrypt.hash(otp, 12);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

    await this.otpRepository.save({
      user,
      otpHash: token,
      type,
      expiresAt,
    });

    return otp;
  }

  async validateOtp(userId: number, otp: string): Promise<boolean> {
    const token = await this.otpRepository.findOne({
      where: {
        user: { id: userId },
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!token) {
      throw new BadRequestException('Verification code is expired');
    }

    const isMAtch = await bcrypt.compare(otp, token.otpHash);

    if (!isMAtch) {
      throw new BadRequestException('Invalid verification code');
    }
    return isMAtch;
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const message = 'Unable to verify email with the provided information';
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new BadRequestException(message);
    }

    if (user.status === 'verified') {
      throw new BadRequestException(message);
    } else if (user.status === 'unverified') {
      await this.validateOtp(user.id, dto.otp);
      await this.userRepository.update(user.id, { status: 'verified' });
      await this.otpRepository.delete({ user: { id: user.id } });
      return { message: 'Email verified successfully' };
    }
  }

  async resendEmailVerification(dto: ResendVerificationDto) {
    const message =
      'If an account exists and requires verification, a code will be sent';

    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.otp', 'otp')
      .select([
        'user.id',
        'user.name',
        'user.status',
        'otp.otpHash',
        'otp.expiresAt',
      ])
      .where('user.email = :email', { email: dto.email })
      .getOne();

    if (!user) {
      throw new BadRequestException(message);
    }

    if (user.status === 'unverified') {
      await this.otpRepository.delete({ user: { id: user.id } });
      const otp = await this.generateOtp(user, OtpEnum.OTP);

      this.emailService
        .sendEmail(
          verificationEmailTemplate({
            email: dto.email,
            otp,
            name: user.name,
          }),
        )
        .catch((err) => {
          console.error('Sending email failed:', err);
        });
    }
    return { message };
  }
}
