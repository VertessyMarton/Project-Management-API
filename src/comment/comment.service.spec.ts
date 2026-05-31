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
      author: { id: 1 },
      task: { id: 3 },
    });
  });

  it('rejects comments for tasks outside the project', async () => {
    taskRepository.findOne.mockResolvedValue({ id: 3, projectId: 11 });

    await expect(
      service.createComment({ content: 'Nope' }, 1, 3, 10),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('only updates comments owned by the author', async () => {
    const updated = { id: 4, content: 'Updated' };
    commentRepository.update.mockResolvedValue({ affected: 1 });
    commentRepository.findOne.mockResolvedValue(updated);

    await expect(
      service.updateComment(4, 1, { content: 'Updated' }),
    ).resolves.toBe(updated);
    expect(commentRepository.update).toHaveBeenCalledWith(
      { id: 4, author: { id: 1 } },
      { content: 'Updated' },
    );
  });
});
