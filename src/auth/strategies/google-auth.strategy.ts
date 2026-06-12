// src/auth/strategies/google.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { OAuthService } from '../oauth.service';
import { OAuthProvider } from '../enums/oauth-provider.enum';
import { getOAuthCallbackUrl } from '../helpers/oauth-callback-url.helper';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    private readonly oauthService: OAuthService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: getOAuthCallbackUrl(configService, 'GOOGLE'),
      scope: ['openid', 'email', 'profile'],
      prompt: 'select_account',
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const email = profile.emails?.[0]?.value ?? profile._json?.email;

    if (!email) {
      throw new UnauthorizedException('Google account has no email');
    }

    return this.oauthService.validateOAuthUser({
      provider: OAuthProvider.GOOGLE,
      providerUserId: profile.id,
      email,
      name: profile.displayName,
    });
  }
}
