import { UserRoleEnum } from '../user/enums/user-role.enum';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    createUser: jest.Mock;
    login: jest.Mock;
    refreshToken: jest.Mock;
  };

  beforeEach(() => {
    authService = {
      createUser: jest.fn(),
      login: jest.fn(),
      refreshToken: jest.fn(),
    };

    controller = new AuthController(authService as any);
  });

  it('registers a user and returns a safe response dto', async () => {
    const createdAt = new Date('2026-05-31T10:00:00.000Z');
    authService.createUser.mockResolvedValue({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed-password',
      status: 'unverified',
      createdAt,
      updatedAt: createdAt,
    });

    await expect(
      controller.createUser({
        name: 'Test User',
        email: 'test@example.com',
        password: 'secret',
      }),
    ).resolves.toEqual({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      status: 'unverified',
      createdAt,
      updatedAt: createdAt,
    });
  });

  it('logs in request user and returns token response dto', async () => {
    const user = {
      id: 1,
      email: 'test@example.com',
      role: UserRoleEnum.USER,
    };
    authService.login.mockResolvedValue({
      user,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    await expect(controller.login({ user })).resolves.toEqual({
      user,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    expect(authService.login).toHaveBeenCalledWith(user);
  });

  it('refreshes access token for the request user', () => {
    authService.refreshToken.mockReturnValue({
      id: 1,
      accessToken: 'new-access-token',
    });

    expect(
      controller.refreshToken({
        user: { id: 1, role: UserRoleEnum.USER },
      }),
    ).toEqual({ id: 1, accessToken: 'new-access-token' });
    expect(authService.refreshToken).toHaveBeenCalledWith(1, UserRoleEnum.USER);
  });
});
