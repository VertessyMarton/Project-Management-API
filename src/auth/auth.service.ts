import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import refreshJwtConfig from './config/refresh-jwt.config';
import type { ConfigType } from '@nestjs/config';
import { OtpService } from 'src/otp/otp.service';
import { OtpEnum } from 'src/otp/enums/otp.enum';
import { EmailService } from 'src/email/email.service';
import { verificationEmailTemplate } from 'src/email/templates/verification-email.template';
import { ValidateUserDto } from './dto/validate-user.dto';
import { AuthenticatedUser, LoginResult } from './types/login-result.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
    private jwtService: JwtService,
    private otpService: OtpService,
    private emailService: EmailService,
  ) {}

  async createUser(
    name: string,
    email: string,
    password: string,
  ): Promise<User> {
    const isUnique = await this.userRepository.findOne({
      where: { email: email },
    });
    if (isUnique) {
      throw new BadRequestException('Email already has been used');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userRepository.save({
      name: name,
      email: email,
      password: hashedPassword,
    });

    const otp = await this.otpService.generateOtp(user, OtpEnum.OTP);

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

  async login(user: AuthenticatedUser): Promise<LoginResult> {
    if (user.status === 'unverified') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, this.refreshTokenConfig);
    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  refreshToken(userId: number, role: string) {
    const payload = { sub: userId, role: role };
    const accessToken = this.jwtService.sign(payload);
    return {
      id: userId,
      accessToken: accessToken,
    };
  }
}
