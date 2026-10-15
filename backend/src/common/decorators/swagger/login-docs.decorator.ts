import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { LoginResponseDto } from 'src/auth/dto/login-response.dto';
import { ValidateUserDto } from 'src/auth/dto/validate-user.dto';

import { BadRequestResponse } from './swagger-docs.helpers';

export function SwaggerLoginDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Validate user and issue access token plus refresh cookie',
    }),
    ApiOkResponse({
      type: LoginResponseDto,
      description:
        'User authenticated. Access token is returned in the response body and refresh token is set as an HTTP-only cookie.',
      headers: {
        'Set-Cookie': {
          description: 'HTTP-only refresh token cookie',
          schema: {
            type: 'string',
            example:
              'refreshToken=token-id.secret; Path=/api/auth; HttpOnly; SameSite=Strict',
          },
        },
      },
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
