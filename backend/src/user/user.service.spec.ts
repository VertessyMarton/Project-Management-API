import { NotFoundException } from '@nestjs/common';
import { UserRoleEnum } from './enums/user-role.enum';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let userRepository: {
    findOne: jest.Mock;
    findOneBy: jest.Mock;
    update: jest.Mock;
  };

  beforeEach(() => {
    userRepository = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      update: jest.fn(),
    };

    service = new UserService(userRepository as any);
  });

  it('returns the current user by id', async () => {
    const user = { id: 1, email: 'me@example.com' };
    userRepository.findOne.mockResolvedValue(user);

    await expect(service.getMe(1)).resolves.toBe(user);
    expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('hides admin users from public lookup', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 1,
      role: UserRoleEnum.ADMIN,
    });

    await expect(service.getUser(1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates and returns the current user', async () => {
    const dto = { name: 'Updated Name' };
    const updatedUser = { id: 1, ...dto };
    userRepository.update.mockResolvedValue({ affected: 1 });
    userRepository.findOneBy.mockResolvedValue(updatedUser);

    await expect(service.updateMe(1, dto)).resolves.toBe(updatedUser);
    expect(userRepository.update).toHaveBeenCalledWith(1, dto);
    expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
  });
});
