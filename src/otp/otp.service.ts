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
      hashedOtp: token,
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

    const isMAtch = await bcrypt.compare(otp, token.hashedOtp);

    if (!isMAtch) {
      throw new BadRequestException('Invalid verification code');
    }
    return isMAtch;
  }

  async verifyEmail(email: string, otp: string) {
    const message = 'Unable to verify email with the provided information';
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return { message };
    }

    if (user.status === 'verified') {
      return { message };
    } else if (user.status === 'unverified') {
      await this.validateOtp(user.id, otp);
      await this.userRepository.update(user.id, { status: 'verified' });
      await this.otpRepository.delete({ user: { id: user.id } });
      return { message: 'Email verified successfully' };
    }
  }
}
