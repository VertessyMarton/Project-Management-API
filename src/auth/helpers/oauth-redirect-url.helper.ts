import { ConfigService } from '@nestjs/config';

export function getOAuthRedirectUrl(configService: ConfigService) {
  const redirectUrl =
    configService.get<string>('NODE_ENV') === 'production'
      ? 'OAUTH_SUCCESS_REDIRECT_URL'
      : 'OAUTH_SUCCESS_REDIRECT_TEST_URL';

  return configService.getOrThrow<string>(`${redirectUrl}`);
}
