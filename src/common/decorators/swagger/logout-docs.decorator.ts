import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { UnauthorizedResponse } from './swagger-docs.helpers';

export function SwaggerLogoutDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Revoke the current refresh token and clear the refresh cookie',
    }),
    ApiCookieAuth('refreshToken'),
    ApiOkResponse({
      description:
        'Refresh token revoked successfully and refresh token cookie cleared.',
      headers: {
        'Set-Cookie': {
          description: 'Clears the refresh token cookie',
          schema: {
            type: 'string',
            example:
              'refreshToken=; Path=/api/auth; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
          },
        },
      },
      schema: {
        example: {
          message: 'Token revoked',
        },
      },
    }),
    UnauthorizedResponse(
      'Thrown when the refresh token cookie is missing, expired, malformed, revoked, or cannot be validated',
      {
        message: 'Invalid token',
        error: 'Unauthorized',
        statusCode: 401,
      },
    ),
  );
}
