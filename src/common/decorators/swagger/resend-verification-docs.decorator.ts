import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { ResendVerificationDto } from 'src/otp/dto/resend-verification.dto';

import { BadRequestResponse, OkResponse } from './swagger-docs.helpers';

const resendMessage =
  'If an account exists and requires verification, a code will be sent';

export function ResendVerificationDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Resend otp code to provided email' }),
    OkResponse('Generates new otp, and replaces the expired one', {
      message: resendMessage,
    }),
    ApiBody({ type: ResendVerificationDto }),
    BadRequestResponse(
      'Thrown when the request body fails validation, or no account exists that requires verification',
      {
        message: resendMessage,
        error: 'Bad Request',
        statusCode: 400,
      },
    ),
  );
}
