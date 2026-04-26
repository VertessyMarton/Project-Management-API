import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { LoginResponseDto } from 'src/auth/dto/login-response.dto';
import { ValidateUserDto } from 'src/auth/dto/validate-user.dto';

import { BadRequestResponse } from './swagger-docs.helpers';

export function SwaggerLoginDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Validate user, only allows verified users' }),
    ApiOkResponse({
      type: LoginResponseDto,
      description: 'User authenticated, jwt tokens sent',
    }),
    ApiBody({ type: ValidateUserDto }),
    BadRequestResponse(
      'Thrown when the email or password is invalid, or the user has not verified their email address',
      {
        message: 'Invalid credentials',
        error: 'Unauthorized',
        statusCode: 400,
      },
    ),
  );
}
