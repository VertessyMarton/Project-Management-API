import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from 'src/otp/otp.service';
import { OtpEnum } from 'src/otp/enums/otp.enum';
import { EmailService } from 'src/email/email.service';
import { verificationEmailTemplate } from 'src/email/templates/verification-email.template';
import { ValidateUserDto } from './dto/validate-user.dto';
import { AuthenticatedUser, LoginResult } from './types/login-result.type';
import { RefreshTokenService } from './refresh-token.service';
import { randomUUID, UUID } from 'crypto';
import { AuditLogService } from 'src/audit-log/audit-log.service';
import { AuditCategory } from 'src/audit-log/enums/log-category.enum';
import { AuditTargetType } from 'src/audit-log/enums/log-target-type.enum';
import { AuditOutcome } from 'src/audit-log/enums/log-outcome.enum';
import { OAuthProvider } from './enums/oauth-provider.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private otpService: OtpService,
    private emailService: EmailService,
    private refreshService: RefreshTokenService,
    private readonly dataSource: DataSource,
    private readonly auditService: AuditLogService,
  ) {}

  async createUser(
    name: string,
    email: string,
    password: string,
    requestId: UUID,
  ): Promise<User> {
    const isUnique = await this.userRepository.findOne({
      where: { email: email },
    });
    if (isUnique) {
      throw new BadRequestException('Email already has been used');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.userRepository.save({
      name: name,
      email: email,
      password: hashedPassword,
    });

    const otp = await this.otpService.generateOtp(user, OtpEnum.OTP);

    await this.dataSource.transaction(async (manager) => {
      await this.auditService.record(
        {
          category: AuditCategory.SECURITY,
          action: 'security.register',
          actorId: null,
          targetType: AuditTargetType.USER,
          targetId: user.id,
          outcome: AuditOutcome.SUCCESS,
          metadata: {
            method: 'password',
            emailVerified: false,
          },
          requestId,
        },
        manager,
      );
    });

    this.emailService
      .sendEmail(
        verificationEmailTemplate({
          email: user.email,
          otp,
          name: user.name,
        }),
      )
      .catch((err) => {
        console.error('Sending email failed:', err);
      });

    return user;
  }

  async validateUser(dto: ValidateUserDto): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (isPasswordValid) {
      const { password, ...result } = user;
      return result;
    }
  }

  async login(
    user: AuthenticatedUser,
    requestId: UUID,
    method: OAuthProvider | 'password',
  ): Promise<LoginResult> {
    if (user.status === 'unverified') {
      throw new ForbiddenException({
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Email needs to be verified before signing in.',
        statusCode: 403,
      });
    }

    const payload = { sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const familyId = randomUUID();
    const refreshToken = await this.refreshService.createRefreshToken(
      user.id,
      familyId,
    );

    await this.dataSource.transaction(async (manager) => {
      await this.auditService.record(
        {
          category: AuditCategory.SECURITY,
          action: 'security.login',
          actorId: null,
          targetType: AuditTargetType.USER,
          targetId: user.id,
          outcome: AuditOutcome.SUCCESS,
          metadata: {
            method: method === 'password' ? 'password' : 'oauth',
            ...(method !== 'password' && { provider: method }),
          },
          requestId,
        },
        manager,
      );
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }
}
