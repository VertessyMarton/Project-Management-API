import { Injectable } from '@nestjs/common';
import { OAuthProfile } from './types/oauth-profile.type';
import { InjectRepository } from '@nestjs/typeorm';
import { OauthAccount } from './entities/oauth-account.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { OAuthProvider } from './enums/oauth-provider.enum';
import { UserStatusEnum } from 'src/user/enums/user-status.enum';

@Injectable()
export class OAuthService {
  constructor(
    @InjectRepository(OauthAccount)
    private oauthRepository: Repository<OauthAccount>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async validateOAuthUser({
    provider,
    providerUserId,
    email,
    name,
  }: OAuthProfile) {
    const oauthAccount = await this.oauthRepository.findOne({
      where: {
        provider,
        providerUserId,
      },
      relations: {
        user: true,
      },
    });

    if (oauthAccount) {
      return oauthAccount.user;
    }

    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (user) {
      await this.linkOAuthAccountToUser(
        provider,
        providerUserId,
        email,
        user.id,
      );

      return user;
    }

    return await this.createOAuthAccount(provider, providerUserId, email, name);
  }

  async createOAuthAccount(
    provider: OAuthProvider,
    providerUserId: string,
    email: string,
    name: string,
  ) {
    const user = await this.userRepository.save({
      name,
      email,
      status: UserStatusEnum.VERIFIED,
    });
    await this.linkOAuthAccountToUser(provider, providerUserId, email, user.id);

    return user;
  }

  async linkOAuthAccountToUser(
    provider: OAuthProvider,
    providerUserId: string,
    email: string,
    userId: number,
  ) {
    await this.oauthRepository.save({
      provider,
      providerUserId,
      email,
      user: { id: userId },
    });
  }
}
