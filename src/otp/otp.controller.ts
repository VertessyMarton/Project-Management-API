import { Body, Controller, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
import { verifyEmailDto } from './dto/verify-email.dto';
import { resendVerificationDto } from './dto/resend-verification.dto';

@Controller('auth')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('/verify-email')
  verifyEmail(@Body() dto: verifyEmailDto) {
    return this.otpService.verifyEmail(dto.email, dto.otp);
  }

  @Post('/resend-verification')
  resendEmailVerification(@Body() dto: resendVerificationDto) {
    return this.otpService.resendEmailVerification(dto.email);
  }
}
