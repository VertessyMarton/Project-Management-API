import { UserController } from './user.controller';

describe('UserController', () => {
  let controller: UserController;
  let userService: {
    getMe: jest.Mock;
    getUser: jest.Mock;
    updateMe: jest.Mock;
  };

  beforeEach(() => {
    userService = {
      getMe: jest.fn(),
      getUser: jest.fn(),
      updateMe: jest.fn(),
    };

    controller = new UserController(userService as any);
  });

  it('gets the current user from the request user id', async () => {
    const user = { id: 1, email: 'me@example.com' };
    userService.getMe.mockResolvedValue(user);

    await expect(controller.getMe({ user: { id: 1 } })).resolves.toBe(user);
    expect(userService.getMe).toHaveBeenCalledWith(1);
  });

  it('gets a user by route id', async () => {
    const user = { id: 2, email: 'user@example.com' };
    userService.getUser.mockResolvedValue(user);

    await expect(controller.getUser(2)).resolves.toBe(user);
    expect(userService.getUser).toHaveBeenCalledWith(2);
  });

  it('updates the current user from the request user id', async () => {
    const dto = { name: 'Updated Name' };
    const user = { id: 1, ...dto };
    userService.updateMe.mockResolvedValue(user);

    await expect(
      controller.updateMe({ user: { id: 1 } }, dto),
    ).resolves.toBe(user);
    expect(userService.updateMe).toHaveBeenCalledWith(1, dto);
  });
});
