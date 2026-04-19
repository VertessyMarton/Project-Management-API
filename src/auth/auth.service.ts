import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
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
  ): Promise<any> {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userRepository.save({
      name: name,
      email: email,
      password: hashedPassword,
    });

    const otp = await this.otpService.generateOtp(user, OtpEnum.OTP);

    await this.emailService.sendEmail(
      verificationEmailTemplate({
        email: user.email,
        otp,
        name: user.name,
      }),
    );

    if (user) {
      const { password, role, ...result } = user;
      return result;
    }

    return null;
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email: email },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      const { password, ...result } = user;
      return result;
    }
  }

  async login(user: any) {
    if (user.status === 'unverified') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, this.refreshTokenConfig);
    return {
      id: user.id,
      accessToken,
      refreshToken,
    };
  }

  refreshToken(userId: number) {
    const payload = { sub: userId };
    const accessToken = this.jwtService.sign(payload);
    return {
      id: userId,
      accessToken: accessToken,
    };
  }
}
