import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Otp } from './entities/otp.entity';
import { DataSource, MoreThan, Repository } from 'typeorm';
import * as crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { OtpEnum } from './enums/otp.enum';
import { User } from 'src/user/entities/user.entity';
import { verificationEmailTemplate } from 'src/email/templates/verification-email.template';
import { EmailService } from 'src/email/email.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { resetPasswordEmailTemplate } from 'src/email/templates/reset-password-email.template';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { randomUUID, UUID } from 'crypto';
import { RefreshToken } from 'src/auth/entities/refresh-token.entity';
import { RefreshTokenEnum } from 'src/auth/enums/refresh-token.enum';
import { UserStatusEnum } from 'src/user/enums/user-status.enum';
import { AuditLogService } from 'src/audit-log/audit-log.service';
import { AuditCategory } from 'src/audit-log/enums/log-category.enum';
import { AuditTargetType } from 'src/audit-log/enums/log-target-type.enum';
import { AuditOutcome } from 'src/audit-log/enums/log-outcome.enum';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
    @InjectRepository(RefreshToken)
    private refreshRepository: Repository<RefreshToken>,
    private emailService: EmailService,
    private auditService: AuditLogService,
    private dataSource: DataSource,
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

  async validateOtp(
    userId: number,
    otp: string,
    type: OtpEnum,
  ): Promise<boolean> {
    const token = await this.otpRepository.findOne({
      where: {
        user: { id: userId },
        type,
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

    if (user.status === UserStatusEnum.VERIFIED) {
      throw new BadRequestException(message);
    } else if (user.status === UserStatusEnum.UNVERIFIED) {
      await this.validateOtp(user.id, dto.otp, OtpEnum.OTP);
      await this.userRepository.update(user.id, {
        status: UserStatusEnum.VERIFIED,
      });
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
      return { message };
    }

    if (user.status === UserStatusEnum.UNVERIFIED) {
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

  async forgotPassword(dto: ForgotPasswordDto, requestId: UUID) {
    const message = 'If an account exists, a password reset link has been sent';
    const secret = crypto.randomBytes(32).toString('hex');
    const selector = randomUUID();
    const resetToken = `${selector}.${secret}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);
    const resetLink = `${process.env.PASSWORD_RESET_URL}?token=${encodeURIComponent(resetToken)}`;

    const record = await this.userRepository.findOne({
      where: {
        email: dto.email,
      },
    });

    if (!record) {
      return {
        message,
      };
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Otp).delete({
        user: { id: record.id },
        type: OtpEnum.RESET_PASSWORD,
      });

      await manager.getRepository(Otp).save({
        selector,
        user: { id: record.id },
        otpHash: await bcrypt.hash(secret, 12),
        type: OtpEnum.RESET_PASSWORD,
        expiresAt,
      });

      await this.auditService.record(
        {
          category: AuditCategory.SECURITY,
          action: 'security.password.forgot',
          actorId: record.id,
          targetType: AuditTargetType.USER,
          targetId: record.id,
          outcome: AuditOutcome.SUCCESS,
          metadata: {
            newOtpId: selector,
          },
          requestId,
        },
        manager,
      );
    });

    try {
      await this.emailService.sendEmail(
        resetPasswordEmailTemplate({
          email: dto.email,
          resetLink,
          name: record.name,
        }),
      );
    } catch (err) {
      console.error('Sending password reset email failed:', err);
      throw new ServiceUnavailableException(
        'Unable to send password reset email right now',
      );
    }

    return {
      message,
    };
  }

  async resetPassword(dto: ResetPasswordDto, requestId: UUID) {
    const [selector, secret] = dto.token.split('.');

    await this.dataSource.transaction(async (manager) => {
      const record = await manager.getRepository(Otp).findOne({
        where: {
          selector,
          type: OtpEnum.RESET_PASSWORD,
          expiresAt: MoreThan(new Date()),
        },
        relations: {
          user: true,
        },
      });

      if (!record) {
        throw new UnauthorizedException('Token not found');
      }

      const valid = await bcrypt.compare(secret, record.otpHash);

      if (!valid) {
        throw new UnauthorizedException('Token is invalid');
      }

      await manager.getRepository(User).update(record.userId, {
        password: await bcrypt.hash(dto.newPassword, 12),
      });

      await manager.getRepository(Otp).delete({ id: record.id });

      await manager.getRepository(RefreshToken).update(record.userId, {
        revoked: true,
        revokedAt: new Date(),
        revokedReason: RefreshTokenEnum.RESET_PASSWORD,
      });

      await this.auditService.record(
        {
          category: AuditCategory.SECURITY,
          action: 'security.password.reset',
          actorId: record.userId,
          targetType: AuditTargetType.USER,
          targetId: record.userId,
          outcome: AuditOutcome.SUCCESS,
          metadata: {
            sessionsRevoked: true,
          },
          requestId,
        },
        manager,
      );

      return { message: 'Password successfully changed' };
    });
  }
}
