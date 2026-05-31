import { NotFoundException } from '@nestjs/common';
import { UserRoleEnum } from '../user/enums/user-role.enum';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  let service: AdminService;
  let userRepository: {
    find: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    count: jest.Mock;
  };
  let projectRepository: {
    find: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    count: jest.Mock;
  };
  let taskRepository: {
    find: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    count: jest.Mock;
  };
  let commentRepository: {
    find: jest.Mock;
    delete: jest.Mock;
    count: jest.Mock;
  };

  beforeEach(() => {
    userRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };
    projectRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };
    taskRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };
    commentRepository = {
      find: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };

    service = new AdminService(
      userRepository as any,
      projectRepository as any,
      taskRepository as any,
      commentRepository as any,
    );
  });

  it('updates a user role and returns the updated user', async () => {
    const user = { id: 1, role: UserRoleEnum.ADMIN };
    userRepository.update.mockResolvedValue({ affected: 1 });
    userRepository.findOne.mockResolvedValue(user);

    await expect(
      service.setUserRole(1, { role: UserRoleEnum.ADMIN }),
    ).resolves.toBe(user);
    expect(userRepository.update).toHaveBeenCalledWith(1, {
      role: UserRoleEnum.ADMIN,
    });
  });

  it('throws when deleting a missing project', async () => {
    projectRepository.delete.mockResolvedValue({ affected: 0 });

    await expect(service.deleteProject(99)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('returns aggregate admin stats', async () => {
    userRepository.count.mockResolvedValue(2);
    projectRepository.count.mockResolvedValue(3);
    taskRepository.count.mockResolvedValue(5);
    commentRepository.count.mockResolvedValue(8);

    await expect(service.getStats()).resolves.toEqual({
      users: 2,
      projects: 3,
      tasks: 5,
      comments: 8,
    });
  });
});
