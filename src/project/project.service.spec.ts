import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ProjectRoleEnum } from './enums/project-role.enum';
import { ProjectService } from './project.service';

describe('ProjectService', () => {
  let service: ProjectService;
  let projectRepository: {
    save: jest.Mock;
    findOne: jest.Mock;
    find: jest.Mock;
    delete: jest.Mock;
    update: jest.Mock;
  };
  let projectMemberRepository: {
    save: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    update: jest.Mock;
  };
  let userRepository: {
    findOne: jest.Mock;
  };

  beforeEach(() => {
    projectRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    };
    projectMemberRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    };
    userRepository = {
      findOne: jest.fn(),
    };

    service = new ProjectService(
      projectRepository as any,
      projectMemberRepository as any,
      userRepository as any,
    );
  });

  it('creates a project and makes the creator an owner', async () => {
    const project = { id: 10, name: 'Roadmap' };
    projectRepository.save.mockResolvedValue(project);

    await expect(
      service.createProject(1, { name: 'Roadmap', description: 'Q2' }),
    ).resolves.toBe(project);

    expect(projectMemberRepository.save).toHaveBeenCalledWith({
      projectId: 10,
      userId: 1,
      role: ProjectRoleEnum.OWNER,
    });
  });

  it('rejects empty project updates', async () => {
    await expect(service.updateProject(1, {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(projectRepository.update).not.toHaveBeenCalled();
  });

  it('does not add a duplicate project member', async () => {
    userRepository.findOne.mockResolvedValue({ id: 2 });
    projectMemberRepository.findOne.mockResolvedValue({ id: 99 });

    await expect(
      service.addProjectMember(1, {
        email: 'member@example.com',
        role: ProjectRoleEnum.MEMBER,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('does not add a project owner through the member endpoint', async () => {
    await expect(
      service.addProjectMember(1, {
        email: 'member@example.com',
        role: ProjectRoleEnum.OWNER,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(userRepository.findOne).not.toHaveBeenCalled();
    expect(projectMemberRepository.save).not.toHaveBeenCalled();
  });

  it('does not remove the project owner through the member endpoint', async () => {
    userRepository.findOne.mockResolvedValue({ id: 2 });
    projectMemberRepository.findOne.mockResolvedValue({
      id: 99,
      role: ProjectRoleEnum.OWNER,
    });

    await expect(
      service.removeProjectMember(1, {
        email: 'owner@example.com',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(projectMemberRepository.delete).not.toHaveBeenCalled();
  });

  it('does not update a member role to owner', async () => {
    userRepository.findOne.mockResolvedValue({ id: 2 });
    projectMemberRepository.findOne.mockResolvedValue({
      id: 99,
      role: ProjectRoleEnum.MEMBER,
    });

    await expect(
      service.updateProjectMemberStatus(1, {
        email: 'member@example.com',
        role: ProjectRoleEnum.OWNER,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(projectMemberRepository.update).not.toHaveBeenCalled();
  });

  it('does not update the project owner role', async () => {
    userRepository.findOne.mockResolvedValue({ id: 2 });
    projectMemberRepository.findOne.mockResolvedValue({
      id: 99,
      role: ProjectRoleEnum.OWNER,
    });

    await expect(
      service.updateProjectMemberStatus(1, {
        email: 'owner@example.com',
        role: ProjectRoleEnum.ADMIN,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(projectMemberRepository.update).not.toHaveBeenCalled();
  });

  it('updates a non-owner project member role', async () => {
    userRepository.findOne.mockResolvedValue({ id: 2 });
    projectMemberRepository.findOne.mockResolvedValue({
      id: 99,
      role: ProjectRoleEnum.MEMBER,
    });
    projectMemberRepository.update.mockResolvedValue({ affected: 1 });

    await expect(
      service.updateProjectMemberStatus(1, {
        email: 'member@example.com',
        role: ProjectRoleEnum.ADMIN,
      }),
    ).resolves.toEqual({
      projectId: 1,
      userId: 2,
      role: ProjectRoleEnum.ADMIN,
    });
    expect(projectMemberRepository.update).toHaveBeenCalledWith(
      { projectId: 1, userId: 2 },
      { role: ProjectRoleEnum.ADMIN },
    );
  });

  it('throws when a requested project does not exist', async () => {
    projectRepository.findOne.mockResolvedValue(null);

    await expect(service.getProject(404)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
