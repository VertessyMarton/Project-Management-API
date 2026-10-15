import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

import { AdminTaskSortField } from 'src/admin/dto/admin.task-query.dto';
import { SortOrder } from 'src/admin/dto/admin.user-query.dto';
import { TaskStatusEnum } from 'src/task/enums/task-status.enum';
import {
  AdminAuthDocs,
  BadRequestResponse,
  IdParam,
  NotFoundResponse,
  OkResponse,
  PaginationQueryDocs,
} from './swagger-docs.helpers';
import {
  adminTaskExample,
  paginatedExample,
  taskExample,
} from './swagger-examples';

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
    ApiOperation({
      summary: 'Admin list tasks',
      description:
        'Returns a paginated list of tasks with project, assignee, and creator context. An unassigned task has a null assignee.',
    }),
    AdminAuthDocs(),
    PaginationQueryDocs(),
    ApiQuery({
      name: 'q',
      required: false,
      type: String,
      example: 'release',
      description: 'Case-insensitive search across task title and description',
    }),
    ApiQuery({
      name: 'projectId',
      required: false,
      type: Number,
      example: 1,
      description: 'Filter by project id',
    }),
    ApiQuery({
      name: 'status',
      required: false,
      enum: TaskStatusEnum,
      description: 'Filter by task status',
    }),
    ApiQuery({
      name: 'assigneeId',
      required: false,
      type: Number,
      example: 2,
      description: 'Filter by assignee user id',
    }),
    ApiQuery({
      name: 'createdById',
      required: false,
      type: Number,
      example: 1,
      description: 'Filter by creator user id',
    }),
    ApiQuery({
      name: 'hasAssignee',
      required: false,
      type: Boolean,
      example: true,
      description:
        'True returns assigned tasks; false returns unassigned tasks',
    }),
    ApiQuery({
      name: 'overdue',
      required: false,
      type: Boolean,
      example: true,
      description:
        'True returns overdue unfinished tasks; false returns tasks that are not overdue',
    }),
    ApiQuery({
      name: 'dueFrom',
      required: false,
      type: String,
      example: '2026-05-01',
      description: 'Return tasks due on or after this ISO date or timestamp',
    }),
    ApiQuery({
      name: 'dueTo',
      required: false,
      type: String,
      example: '2026-05-31',
      description:
        'Return tasks due through this ISO date or timestamp. A date-only value includes the entire day',
    }),
    ApiQuery({
      name: 'createdFrom',
      required: false,
      type: String,
      example: '2026-04-01',
      description:
        'Return tasks created on or after this ISO date or timestamp',
    }),
    ApiQuery({
      name: 'createdTo',
      required: false,
      type: String,
      example: '2026-04-30',
      description:
        'Return tasks created through this ISO date or timestamp. A date-only value includes the entire day',
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      enum: AdminTaskSortField,
      example: AdminTaskSortField.CREATED_AT,
      description: 'Field used to sort the tasks',
    }),
    ApiQuery({
      name: 'sortOrder',
      required: false,
      enum: SortOrder,
      example: SortOrder.DESC,
      description: 'Sort direction',
    }),
    OkResponse(
      'Paginated tasks returned',
      paginatedExample([adminTaskExample]),
    ),
    BadRequestResponse('Thrown when query parameters fail validation', {
      message: [
        'status must be one of the following values: todo, in_progress, review, done',
      ],
      error: 'Bad Request',
      statusCode: 400,
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
