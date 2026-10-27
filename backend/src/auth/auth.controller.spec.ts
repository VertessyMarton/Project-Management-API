import { UserRoleEnum } from '../user/enums/user-role.enum';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  const requestId = '00000000-0000-4000-8000-000000000001';
  let controller: AuthController;
  let authService: {
    createUser: jest.Mock;
    login: jest.Mock;
  };
  let refreshService: {
    refreshToken: jest.Mock;
  };
  let response: {
    cookie: jest.Mock;
  };

  beforeEach(() => {
    authService = {
      createUser: jest.fn(),
      login: jest.fn(),
    };
    refreshService = {
      refreshToken: jest.fn(),
    };
    response = {
      cookie: jest.fn(),
    };

    controller = new AuthController(
      authService as any,
      refreshService as any,
      {} as any,
    );
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
      controller.createUser(
        {
          name: 'Test User',
          email: 'test@example.com',
          password: 'secret',
        },
        { requestId },
      ),
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

    await expect(
      controller.login({ user, requestId }, response as any),
    ).resolves.toEqual({
      user,
      accessToken: 'access-token',
    });
    expect(authService.login).toHaveBeenCalledWith(user, requestId, 'password');
    expect(response.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'refresh-token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'strict',
        path: '/api/auth',
      }),
    );
  });

  it('refreshes access token from the refresh-token cookie', async () => {
    refreshService.refreshToken.mockResolvedValue({
      id: 1,
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });

    await expect(
      controller.refreshToken(
        {
          cookies: { refreshToken: 'old-refresh-token' },
          requestId,
        },
        response as any,
      ),
    ).resolves.toEqual({ id: 1, accessToken: 'new-access-token' });
    expect(refreshService.refreshToken).toHaveBeenCalledWith(
      'old-refresh-token',
      requestId,
    );
    expect(response.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'new-refresh-token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'strict',
        path: '/api/auth',
      }),
    );
  });
});
