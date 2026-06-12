import { applyDecorators } from '@nestjs/common';
import {
  ApiFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

type OAuthProviderName = 'Google' | 'GitHub' | 'Microsoft';

const refreshCookieHeader = {
  description: 'HTTP-only refresh token cookie',
  schema: {
    type: 'string',
    example:
      'refreshToken=token-id.secret; Path=/api/auth; HttpOnly; SameSite=Strict',
  },
};

export function SwaggerOAuthLoginDocs(provider: OAuthProviderName) {
  return applyDecorators(
    ApiOperation({
      summary: `Start ${provider} OAuth login`,
      description:
        'Redirects the browser to the OAuth provider authorization page. This endpoint is intended to be opened by a browser, not called as a JSON API.',
    }),
    ApiFoundResponse({
      description: `Browser redirected to ${provider} for authentication.`,
      headers: {
        Location: {
          description: `${provider} authorization URL`,
          schema: { type: 'string' },
        },
      },
    }),
  );
}

export function SwaggerOAuthCallbackDocs(provider: OAuthProviderName) {
  return applyDecorators(
    ApiOperation({
      summary: `Handle ${provider} OAuth callback`,
      description:
        'Provider callback endpoint. On success, the API creates or links the local user, sets the refresh token cookie, and redirects to the configured OAuth success URL.',
    }),
    ApiFoundResponse({
      description:
        'OAuth login succeeded. Refresh token cookie was set and the browser was redirected to the configured success URL.',
      headers: {
        'Set-Cookie': refreshCookieHeader,
        Location: {
          description: 'Configured OAuth success redirect URL',
          schema: { type: 'string' },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description:
        'Thrown when the provider callback cannot be validated or the provider account cannot be mapped to a local user. The OAuth failure filter may redirect the browser to the configured failure URL.',
      schema: {
        example: {
          message: `${provider} OAuth failed`,
          error: 'Unauthorized',
          statusCode: 401,
        },
      },
    }),
  );
}

export function SwaggerOAuthSuccessDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Temporary OAuth success endpoint',
      description:
        'Backend-only success page used while no frontend OAuth success route is available.',
    }),
    ApiOkResponse({
      description: 'OAuth login completed successfully.',
      schema: {
        example: {
          message: 'OAuth login successful',
        },
      },
    }),
  );
}

export function SwaggerOAuthFailureDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Temporary OAuth failure endpoint',
      description:
        'Backend-only failure page used while no frontend OAuth failure route is available.',
    }),
    ApiOkResponse({
      description: 'OAuth login failed.',
      schema: {
        example: {
          message: 'OAuth login failed',
        },
      },
    }),
  );
}
