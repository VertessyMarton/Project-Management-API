import { forwardRef, Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { Otp } from './entities/otp.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from 'src/email/email.module';
import { User } from 'src/user/entities/user.entity';
import { OtpController } from './otp.controller';
import { RefreshToken } from 'src/auth/entities/refresh-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Otp, User, RefreshToken]), EmailModule],
  providers: [OtpService],
  controllers: [OtpController],
  exports: [OtpService],
})
export class OtpModule {}
