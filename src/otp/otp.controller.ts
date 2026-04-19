import { Body, Controller, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
import { verifyEmailDto } from './dto/verify-email.dto';

@Controller('auth')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('/verify-email')
  verifyEmail(@Body() dto: verifyEmailDto) {
    return this.otpService.verifyEmail(dto.email, dto.otp);
  }
}
