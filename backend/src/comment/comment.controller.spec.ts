import { CommentController } from './comment.controller';

describe('CommentController', () => {
  let controller: CommentController;
  let commentService: {
    createComment: jest.Mock;
    findAllComment: jest.Mock;
    findOneComment: jest.Mock;
    updateComment: jest.Mock;
    removeComment: jest.Mock;
  };

  beforeEach(() => {
    commentService = {
      createComment: jest.fn(),
      findAllComment: jest.fn(),
      findOneComment: jest.fn(),
      updateComment: jest.fn(),
      removeComment: jest.fn(),
    };

    controller = new CommentController(commentService as any);
  });

  it('creates a comment with request user, task, and project ids', async () => {
    const dto = { content: 'Looks good' };
    const comment = { id: 7, ...dto };
    commentService.createComment.mockResolvedValue(comment);

    await expect(
      controller.createComment({ user: { id: 1 } }, 10, 3, dto),
    ).resolves.toBe(comment);
    expect(commentService.createComment).toHaveBeenCalledWith(dto, 1, 3, 10);
  });

  it('finds a comment with comment, task, and project ids', async () => {
    const comment = { id: 7 };
    commentService.findOneComment.mockResolvedValue(comment);

    await expect(controller.findOneComment(7, 3, 10)).resolves.toBe(comment);
    expect(commentService.findOneComment).toHaveBeenCalledWith(7, 3, 10);
  });

  it('updates only the request users comment', async () => {
    const dto = { content: 'Updated' };
    const comment = { id: 7, ...dto };
    commentService.updateComment.mockResolvedValue(comment);

    await expect(
      controller.updateComment({ user: { id: 1 } }, 7, 3, 10, dto),
    ).resolves.toBe(comment);
    expect(commentService.updateComment).toHaveBeenCalledWith(
      7,
      1,
      3,
      10,
      dto,
    );
  });

  it('lists comments with task and project ids', async () => {
    const comments = [{ id: 7 }];
    commentService.findAllComment.mockResolvedValue(comments);

    await expect(controller.findAllComment(3, 10)).resolves.toBe(comments);
    expect(commentService.findAllComment).toHaveBeenCalledWith(3, 10);
  });

  it('removes comments with user, task, and project ids', async () => {
    const result = { message: 'Comment deleted' };
    commentService.removeComment.mockResolvedValue(result);

    await expect(
      controller.removeComment({ user: { id: 1 } }, 7, 3, 10),
    ).resolves.toBe(result);
    expect(commentService.removeComment).toHaveBeenCalledWith(7, 1, 3, 10);
  });
});
