import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

import {
  AdminCommentSortField,
  SortOrder,
} from 'src/admin/dto/admin.comment-query.dto';
import {
  AdminAuthDocs,
  BadRequestResponse,
  IdParam,
  NotFoundResponse,
  OkResponse,
  PaginationQueryDocs,
} from './swagger-docs.helpers';
import { adminCommentExample, paginatedExample } from './swagger-examples';

const commentIdParam = IdParam('commentId', 'Comment id');

export function AdminFindAllCommentDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Admin list comments',
      description:
        'Returns a paginated list of comments with author, task, and project context.',
    }),
    AdminAuthDocs(),
    PaginationQueryDocs(),
    ApiQuery({
      name: 'q',
      required: false,
      type: String,
      example: 'ready to ship',
      description: 'Case-insensitive search within comment content',
    }),
    ApiQuery({
      name: 'projectId',
      required: false,
      type: Number,
      example: 1,
      description: "Filter by the comment task's project id",
    }),
    ApiQuery({
      name: 'taskId',
      required: false,
      type: Number,
      example: 1,
      description: 'Filter by task id',
    }),
    ApiQuery({
      name: 'authorId',
      required: false,
      type: Number,
      example: 1,
      description: 'Filter by comment author id',
    }),
    ApiQuery({
      name: 'createdFrom',
      required: false,
      type: String,
      example: '2026-04-01',
      description:
        'Return comments created on or after this ISO date or timestamp',
    }),
    ApiQuery({
      name: 'createdTo',
      required: false,
      type: String,
      example: '2026-04-30',
      description:
        'Return comments created through this ISO date or timestamp. A date-only value includes the entire day',
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      enum: AdminCommentSortField,
      example: AdminCommentSortField.CREATED_AT,
      description: 'Field used to sort the comments',
    }),
    ApiQuery({
      name: 'sortOrder',
      required: false,
      enum: SortOrder,
      example: SortOrder.DESC,
      description: 'Sort direction',
    }),
    OkResponse(
      'Paginated comments returned',
      paginatedExample([adminCommentExample]),
    ),
    BadRequestResponse('Thrown when query parameters fail validation', {
      message: ['authorId must not be less than 1'],
      error: 'Bad Request',
      statusCode: 400,
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
