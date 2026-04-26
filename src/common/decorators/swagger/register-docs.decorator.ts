import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { RegisterResponseDto } from 'src/auth/dto/register-response.dto';
import { RegisterDto } from 'src/auth/dto/register.dto';

import { BadRequestResponse } from './swagger-docs.helpers';

export function SwaggerRegisterDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Register user and send a verification email' }),
    ApiCreatedResponse({
      type: RegisterResponseDto,
      description: 'User registered successfully. Verification email sent.',
    }),
    ApiBody({ type: RegisterDto }),
    BadRequestResponse(
      'Thrown when the request body fails validation, or the email address is already registered',
      {
        message: 'Email already has been used',
        error: 'Bad Request',
        statusCode: 400,
      },
    ),
  );
}
