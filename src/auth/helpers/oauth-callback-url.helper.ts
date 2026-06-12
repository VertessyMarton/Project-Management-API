import { ConfigService } from '@nestjs/config';

export function getOAuthCallbackUrl(
  configService: ConfigService,
  provider: 'GOOGLE' | 'GITHUB' | 'MICROSOFT',
) {
  const suffix =
    configService.get<string>('NODE_ENV') === 'production'
      ? 'CALLBACK_URL'
      : 'CALLBACK_TEST_URL';

  return configService.getOrThrow<string>(`${provider}_${suffix}`);
}
