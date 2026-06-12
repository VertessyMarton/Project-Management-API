import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { OAuthService } from '../oauth.service';
import { Profile } from 'passport';
import { OAuthProvider } from '../enums/oauth-provider.enum';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { getOAuthCallbackUrl } from '../helpers/oauth-callback-url.helper';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly oauthService: OAuthService,
    configService: ConfigService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: getOAuthCallbackUrl(configService, 'GITHUB'),
      scope: ['user:email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ) {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      throw new UnauthorizedException('GitHub account has no email');
    }

    return this.oauthService.validateOAuthUser({
      provider: OAuthProvider.GITHUB,
      providerUserId: profile.id,
      email,
      name: profile.displayName || profile.username || email.split('@')[0],
    });
  }
}
