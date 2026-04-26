import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

import { VerifyEmailDto } from 'src/otp/dto/verify-email.dto';
import { BadRequestResponse, OkResponse } from './swagger-docs.helpers';

export function VerifyEmailDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Verify otp code sent to email at registry' }),
    OkResponse('User status set to verified, otp deleted from database', {
      message: 'Email verified successfully',
    }),
    ApiBody({ type: VerifyEmailDto }),
    BadRequestResponse(
      'Thrown when the email is unknown, already verified, or the verification code is invalid or expired',
      {
        message: 'Unable to verify email with the provided information',
        error: 'Bad Request',
        statusCode: 400,
      },
    ),
  );
}
