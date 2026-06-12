import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { OAuthService } from '../oauth.service';
import { Profile } from 'passport';
import { OAuthProvider } from '../enums/oauth-provider.enum';
import { Strategy } from 'passport-microsoft';
import { ConfigService } from '@nestjs/config';
import { getOAuthCallbackUrl } from '../helpers/oauth-callback-url.helper';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(
    private readonly oauthService: OAuthService,
    configService: ConfigService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('MICROSOFT_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('MICROSOFT_CLIENT_SECRET'),
      tenant: configService.getOrThrow<string>('MICROSOFT_TENANT_ID', 'common'),
      callbackURL: getOAuthCallbackUrl(configService, 'MICROSOFT'),
      scope: ['user.read'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ) {
    const microsoftProfile = profile as Profile & {
      userPrincipalName?: string;
      _json?: {
        mail?: string;
        userPrincipalName?: string;
      };
    };

    const email =
      profile.emails?.[0]?.value ??
      microsoftProfile._json?.mail ??
      microsoftProfile.userPrincipalName ??
      microsoftProfile._json?.userPrincipalName;

    if (!email) {
      throw new UnauthorizedException('Microsoft account has no email');
    }

    return this.oauthService.validateOAuthUser({
      provider: OAuthProvider.MICROSOFT,
      providerUserId: profile.id,
      email,
      name: profile.displayName || profile.username || email,
    });
  }
}
