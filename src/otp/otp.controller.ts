import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { VerifyEmailDocs } from 'src/common/decorators/swagger/verify-email-docs.decorator';
import { ResendVerificationDocs } from 'src/common/decorators/swagger/resend-verification-docs.decorator';
import {
  OtpLimit,
  ResendOtpLimit,
} from 'src/common/decorators/rate-limit.decorator';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @HttpCode(200)
  @VerifyEmailDocs()
  @OtpLimit()
  @Post('/verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.otpService.verifyEmail(dto);
  }

  @HttpCode(200)
  @ResendVerificationDocs()
  @ResendOtpLimit()
  @Post('/resend-verification')
  resendEmailVerification(@Body() dto: ResendVerificationDto) {
    return this.otpService.resendEmailVerification(dto);
  }

  @HttpCode(200)
  @OtpLimit()
  @Post('/forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.otpService.forgotPassword(dto);
  }

  @HttpCode(200)
  @OtpLimit()
  @Post('/reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.otpService.resetPassword(dto);
  }
}
