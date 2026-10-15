import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { UnauthorizedResponse } from './swagger-docs.helpers';

export function SwaggerRefreshDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Rotate refresh token and issue a new access token',
    }),
    ApiCookieAuth('refreshToken'),
    ApiOkResponse({
      description:
        'Refresh token valid. New access token is returned in the response body and rotated refresh token is set as an HTTP-only cookie.',
      headers: {
        'Set-Cookie': {
          description: 'Rotated HTTP-only refresh token cookie',
          schema: {
            type: 'string',
            example:
              'refreshToken=new-token-id.new-secret; Path=/api/auth; HttpOnly; SameSite=Strict',
          },
        },
      },
      schema: {
        example: {
          id: 1,
          accessToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access-token-signature',
        },
      },
    }),
    UnauthorizedResponse(
      'Thrown when the refresh token cookie is missing, expired, malformed, revoked, reused, or cannot be validated',
      {
        message: 'Invalid token',
        error: 'Unauthorized',
        statusCode: 401,
      },
    ),
  );
}
