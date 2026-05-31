import { TaskStatusEnum } from './enums/task-status.enum';
import { TaskController } from './task.controller';

describe('TaskController', () => {
  let controller: TaskController;
  let taskService: {
    createTask: jest.Mock;
    findAllTask: jest.Mock;
    findOneTask: jest.Mock;
    updateTask: jest.Mock;
    removeTask: jest.Mock;
  };

  beforeEach(() => {
    taskService = {
      createTask: jest.fn(),
      findAllTask: jest.fn(),
      findOneTask: jest.fn(),
      updateTask: jest.fn(),
      removeTask: jest.fn(),
    };

    controller = new TaskController(taskService as any);
  });

  it('creates a task with project and creator ids', async () => {
    const dto = {
      title: 'Ship tests',
      description: 'Important paths',
      status: TaskStatusEnum.TODO,
      dueDate: new Date('2026-06-01T00:00:00.000Z'),
      assignee: 2,
    };
    const task = { id: 5, ...dto };
    taskService.createTask.mockResolvedValue(task);

    await expect(
      controller.createTask({ user: { id: 1 } }, 10, dto),
    ).resolves.toBe(task);
    expect(taskService.createTask).toHaveBeenCalledWith(dto, 1, 10);
  });

  it('finds one task inside a project', () => {
    const task = { id: 5 };
    taskService.findOneTask.mockReturnValue(task);

    expect(controller.findOneTask(10, 5)).toBe(task);
    expect(taskService.findOneTask).toHaveBeenCalledWith(10, 5);
  });

  it('updates a task by task id', () => {
    const dto = { status: TaskStatusEnum.DONE };
    const task = { id: 5, ...dto };
    taskService.updateTask.mockReturnValue(task);

    expect(controller.updateTask(5, dto)).toBe(task);
    expect(taskService.updateTask).toHaveBeenCalledWith(5, dto);
  });
});
