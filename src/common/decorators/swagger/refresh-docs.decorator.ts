import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { BadRequestResponse, OkResponse } from './swagger-docs.helpers';

export function SwaggerRefreshDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Verify sent refresh token, and issues a new access token',
    }),
    ApiBearerAuth(),
    OkResponse('Refresh token valid, new access token sent', {
      id: 1,
      accessToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access-token-signature',
    }),
    BadRequestResponse(
      'Thrown when the refresh token is missing, expired, malformed, or cannot be validated',
      {
        error: 'Unauthorized',
        statusCode: 400,
      },
    ),
  );
}
