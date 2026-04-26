import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import {
  AdminAuthDocs,
  IdParam,
  NotFoundResponse,
  OkResponse,
} from './swagger-docs.helpers';
import { commentExample } from './swagger-examples';

const commentIdParam = IdParam('commentId', 'Comment id');

export function AdminFindAllCommentDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Admin get all comments' }),
    AdminAuthDocs(),
    OkResponse('Comments returned', [commentExample]),
    NotFoundResponse('Thrown when no comments can be found', {
      message: 'Comment not found',
      error: 'Not Found',
      statusCode: 404,
    }),
  );
}

export function AdminDeleteCommentDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Admin delete comment by id' }),
    AdminAuthDocs(),
    commentIdParam,
    OkResponse('Comment deleted', { message: 'Comment deleted' }),
    NotFoundResponse(
      'Thrown when no comment exists with the provided commentId',
      {
        message: 'Comment not found',
        error: 'Not Found',
        statusCode: 404,
      },
    ),
  );
}
