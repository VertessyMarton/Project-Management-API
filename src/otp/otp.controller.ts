import { Body, Controller, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';

@Controller('auth')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('/verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.otpService.verifyEmail(dto.email, dto.otp);
  }

  @Post('/resend-verification')
  resendEmailVerification(@Body() dto: ResendVerificationDto) {
    return this.otpService.resendEmailVerification(dto.email);
  }
}
