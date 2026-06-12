import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import jwtConfig from './config/jwt.config';
import { EmailModule } from 'src/email/email.module';
import { OtpModule } from 'src/otp/otp.module';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { OauthAccount } from './entities/oauth-account.entity';
import { OAuthService } from './oauth.service';
import { GoogleStrategy } from './strategies/google-auth.strategy';
import { GithubStrategy } from './strategies/github-auth.strategy';
import { MicrosoftStrategy } from './strategies/microsoft-auth.strategy';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User, RefreshToken, OauthAccount]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    EmailModule,
    OtpModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RefreshTokenService,
    OAuthService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
  ],
})
export class AuthModule {}
