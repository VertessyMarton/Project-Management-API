import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { Otp } from './entities/otp.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from 'src/email/email.module';
import { User } from 'src/user/entities/user.entity';
import { OtpController } from './otp.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Otp, User]), EmailModule],
  providers: [OtpService],
  controllers: [OtpController],
  exports: [OtpService],
})
export class OtpModule {}
