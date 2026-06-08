import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { UnauthorizedResponse } from './swagger-docs.helpers';
import { ForgotPasswordDto } from 'src/otp/dto/forgot-password.dto';

export function ForgotPasswordDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Sends out an email for reset password',
    }),
    ApiOkResponse({
      description:
        'Token is generated, hashed version is saved in the database, email service sent out the reset link',
      schema: {
        example: {
          message: 'If an account exists, a password reset link has been sent',
        },
      },
    }),
    ApiBody({ type: ForgotPasswordDto }),
    UnauthorizedResponse('Thrown when the email is invalid', {
      message: 'If an account exists, a password reset link has been sent',
      error: 'Unauthorized',
      statusCode: 401,
    }),
  );
}
