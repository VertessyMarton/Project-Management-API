import { NotFoundException } from '@nestjs/common';
import { CommentService } from './comment.service';

describe('CommentService', () => {
  let service: CommentService;
  let commentRepository: {
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  let taskRepository: {
    findOne: jest.Mock;
  };

  beforeEach(() => {
    commentRepository = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    taskRepository = {
      findOne: jest.fn(),
    };

    service = new CommentService(
      commentRepository as any,
      taskRepository as any,
    );
  });

  it('creates a comment for a task in the same project', async () => {
    const comment = { id: 7, content: 'Looks good' };
    taskRepository.findOne.mockResolvedValue({ id: 3, projectId: 10 });
    commentRepository.save.mockResolvedValue(comment);

    await expect(
      service.createComment({ content: 'Looks good' }, 1, 3, 10),
    ).resolves.toBe(comment);
    expect(commentRepository.save).toHaveBeenCalledWith({
      content: 'Looks good',
      authorId: 1,
      taskId: 3,
    });
  });

  it('rejects comments for tasks outside the project', async () => {
    taskRepository.findOne.mockResolvedValue(null);

    await expect(
      service.createComment({ content: 'Nope' }, 1, 3, 10),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(taskRepository.findOne).toHaveBeenCalledWith({
      where: { id: 3, projectId: 10 },
    });
  });

  it('only updates comments owned by the author', async () => {
    const updated = { id: 4, content: 'Updated' };
    commentRepository.findOne
      .mockResolvedValueOnce({ id: 4, authorId: 1, taskId: 3 })
      .mockResolvedValueOnce(updated);
    commentRepository.update.mockResolvedValue({ affected: 1 });

    await expect(
      service.updateComment(4, 1, 3, 10, { content: 'Updated' }),
    ).resolves.toBe(updated);
    expect(commentRepository.findOne).toHaveBeenNthCalledWith(1, {
      where: {
        id: 4,
        authorId: 1,
        task: { id: 3, projectId: 10 },
      },
    });
    expect(commentRepository.update).toHaveBeenCalledWith(
      { id: 4, authorId: 1, taskId: 3 },
      { content: 'Updated' },
    );
  });

  it('finds one comment only inside the selected task and project', async () => {
    const comment = { id: 4, taskId: 3 };
    commentRepository.findOne.mockResolvedValue(comment);

    await expect(service.findOneComment(4, 3, 10)).resolves.toBe(comment);
    expect(commentRepository.findOne).toHaveBeenCalledWith({
      where: { id: 4, task: { id: 3, projectId: 10 } },
    });
  });
});
