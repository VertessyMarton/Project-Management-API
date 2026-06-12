import { OAuthProvider } from '../enums/oauth-provider.enum';

export type OAuthProfile = {
  provider: OAuthProvider;
  providerUserId: string;
  email: string;
  name: string;
};
