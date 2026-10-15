import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { UnauthorizedResponse } from './swagger-docs.helpers';
import { ResetPasswordDto } from 'src/otp/dto/reset-password.dto';

export function ResetPasswordDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Allows user to reset their passwords',
    }),
    ApiOkResponse({
      description:
        'Searches for the token, validates it, set the new password, and logs out the user',
      schema: {
        example: {
          message: 'Password successfully changed',
        },
      },
    }),
    ApiBody({ type: ResetPasswordDto }),
    UnauthorizedResponse(
      'Thrown when the selector is not found, or the token doesnt match the hashed value',
      {
        message: 'Token is invalid',
        error: 'Unauthorized',
        statusCode: 401,
      },
    ),
  );
}
