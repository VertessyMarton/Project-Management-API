import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import {
  AdminAuthDocs,
  IdParam,
  NotFoundResponse,
  OkResponse,
} from './swagger-docs.helpers';
import { taskExample } from './swagger-examples';

const taskIdParam = IdParam('taskId', 'Task id');
const taskNotFound = NotFoundResponse(
  'Thrown when no task exists with the provided taskId',
  {
    message: 'Task not found',
    error: 'Not Found',
    statusCode: 404,
  },
);

export function AdminFindAllTaskDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Admin get all tasks' }),
    AdminAuthDocs(),
    OkResponse('Tasks returned', [taskExample]),
    NotFoundResponse('Thrown when no tasks can be found', {
      message: 'Task not found',
      error: 'Not Found',
      statusCode: 404,
    }),
  );
}

export function AdminFindOneTaskDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Admin get task by id' }),
    AdminAuthDocs(),
    taskIdParam,
    OkResponse('Task returned', taskExample),
    taskNotFound,
  );
}

export function AdminDeleteTaskDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Admin delete task by id' }),
    AdminAuthDocs(),
    taskIdParam,
    OkResponse('Task deleted', { message: 'Task deleted' }),
    taskNotFound,
  );
}
