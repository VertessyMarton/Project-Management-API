import type { User } from 'src/user/entities/user.entity';

export type AuthenticatedUser = Pick<User, 'id' | 'email' | 'role' | 'status'>;

export type LoginResult = {
  accessToken: string;
  refreshToken: string;
  user: AuthenticatedUser;
};
