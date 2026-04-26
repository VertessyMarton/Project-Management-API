import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { VerifyEmailDocs } from 'src/common/decorators/swagger/verify-email-docs.decorator';
import { ResendVerificationDocs } from 'src/common/decorators/swagger/resend-verification-docs.decorator';

@Controller('auth')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @HttpCode(200)
  @VerifyEmailDocs()
  @Post('/verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.otpService.verifyEmail(dto);
  }

  @HttpCode(200)
  @ResendVerificationDocs()
  @Post('/resend-verification')
  resendEmailVerification(@Body() dto: ResendVerificationDto) {
    return this.otpService.resendEmailVerification(dto);
  }
}
