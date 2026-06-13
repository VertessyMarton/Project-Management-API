import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TaskStatusEnum } from './enums/task-status.enum';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let userRepository: {
    findOne: jest.Mock;
    findOneBy: jest.Mock;
  };
  let taskRepository: {
    save: jest.Mock;
    findOne: jest.Mock;
    find: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(() => {
    userRepository = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
    };
    taskRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    service = new TaskService(userRepository as any, taskRepository as any);
  });

  it('creates a task only when the assignee exists', async () => {
    const dto = {
      title: 'Ship tests',
      description: 'Cover the important paths',
      status: TaskStatusEnum.TODO,
      dueDate: new Date('2026-06-01T00:00:00.000Z'),
      assignee: 2,
    };
    const task = { id: 5, ...dto };
    userRepository.findOne.mockResolvedValue({ id: 2 });
    taskRepository.save.mockResolvedValue({ id: 5 });
    taskRepository.findOne.mockResolvedValue(task);

    await expect(service.createTask(dto, 1, 10)).resolves.toBe(task);
    expect(taskRepository.save).toHaveBeenCalledWith({
      title: dto.title,
      description: dto.description,
      status: dto.status,
      dueDate: dto.dueDate,
      createdById: 1,
      projectId: 10,
      assignee: { id: 2 },
    });
    expect(taskRepository.findOne).toHaveBeenCalledWith({
      where: { id: 5, projectId: 10 },
    });
  });

  it('throws when no tasks exist for a project', async () => {
    taskRepository.find.mockResolvedValue([]);

    await expect(service.findAllTask(10)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('rejects empty task updates', async () => {
    await expect(service.updateTask(1, 10, {} as any)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(taskRepository.update).not.toHaveBeenCalled();
  });

  it('updates a task only inside the selected project', async () => {
    const dto = { status: TaskStatusEnum.DONE };
    const task = { id: 1, projectId: 10, status: TaskStatusEnum.DONE };
    taskRepository.update.mockResolvedValue({ affected: 1 });
    taskRepository.findOne.mockResolvedValue(task);

    await expect(service.updateTask(1, 10, dto)).resolves.toBe(task);
    expect(taskRepository.update).toHaveBeenCalledWith(
      { id: 1, projectId: 10 },
      { status: TaskStatusEnum.DONE },
    );
  });

  it('throws when deleting a task outside the selected project', async () => {
    taskRepository.delete.mockResolvedValue({ affected: 0 });

    await expect(service.removeTask(1, 10)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
