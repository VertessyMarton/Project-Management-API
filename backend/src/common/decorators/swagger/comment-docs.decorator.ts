import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

import { CreateCommentDto } from 'src/comment/dto/create-comment.dto';
import { UpdateCommentDto } from 'src/comment/dto/update-comment.dto';
import {
  BadRequestResponse,
  CreatedResponse,
  IdParam,
  NotFoundResponse,
  OkResponse,
  ProjectMemberAuthDocs,
} from './swagger-docs.helpers';
import { commentExample } from './swagger-examples';

const projectIdParam = IdParam('projectId', 'Project id');
const taskIdParam = IdParam('taskId', 'Task id');
const commentIdParam = IdParam('commentId', 'Comment id');
const commentNotFound = NotFoundResponse(
  'Thrown when the comment id does not belong to an existing comment, or the project membership cannot be found',
  {
    message: 'Resource not found',
    error: 'Not Found',
    statusCode: 404,
  },
);

export function CreateCommentDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Create comment on task' }),
    ProjectMemberAuthDocs(),
    projectIdParam,
    taskIdParam,
    ApiBody({ type: CreateCommentDto }),
    CreatedResponse('Comment created', commentExample),
    BadRequestResponse(
      'Thrown when the submitted comment fields fail validation',
      {
        message: ['content should not be empty'],
        error: 'Bad Request',
        statusCode: 400,
      },
    ),
    NotFoundResponse(
      'Thrown when the task does not belong to the requested project, or the project membership cannot be found',
      {
        message: 'Resource not found',
        error: 'Not Found',
        statusCode: 404,
      },
    ),
  );
}

export function FindAllCommentDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get task comments' }),
    ProjectMemberAuthDocs(),
    projectIdParam,
    taskIdParam,
    OkResponse('Task comments returned', [commentExample]),
  );
}

export function FindOneCommentDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get comment by id' }),
    ProjectMemberAuthDocs(),
    projectIdParam,
    taskIdParam,
    commentIdParam,
    OkResponse('Comment returned', commentExample),
    commentNotFound,
  );
}

export function UpdateCommentDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Update comment by id' }),
    ProjectMemberAuthDocs(),
    projectIdParam,
    taskIdParam,
    commentIdParam,
    ApiBody({ type: UpdateCommentDto }),
    OkResponse('Comment updated', commentExample),
    BadRequestResponse(
      'Thrown when the submitted comment fields fail validation',
      {
        message: ['content must be a string'],
        error: 'Bad Request',
        statusCode: 400,
      },
    ),
    commentNotFound,
  );
}

export function RemoveCommentDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete comment by id' }),
    ProjectMemberAuthDocs(),
    projectIdParam,
    taskIdParam,
    commentIdParam,
    OkResponse('Comment deleted', { message: 'Comment deleted' }),
    commentNotFound,
  );
}
