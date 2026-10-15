import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery } from '@nestjs/swagger';

import { CreateTaskDto } from 'src/task/dto/create-task.dto';
import { SortOrder, TaskSortField } from 'src/task/dto/task-query.dto';
import { UpdateTaskDto } from 'src/task/dto/update-task.dto';
import { TaskStatusEnum } from 'src/task/enums/task-status.enum';
import {
  BadRequestResponse,
  CreatedResponse,
  IdParam,
  NotFoundResponse,
  OkResponse,
  PaginationQueryDocs,
  ProjectMemberAuthDocs,
} from './swagger-docs.helpers';
import { paginatedExample, taskExample } from './swagger-examples';

const projectIdParam = IdParam('projectId', 'Project id');
const taskIdParam = IdParam('taskId', 'Task id');

export function CreateTaskDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Create task in project' }),
    ProjectMemberAuthDocs(),
    projectIdParam,
    ApiBody({ type: CreateTaskDto }),
    CreatedResponse('Task created', taskExample),
    BadRequestResponse(
      'Thrown when the submitted task fields fail validation',
      {
        message: ['title should not be empty'],
        error: 'Bad Request',
        statusCode: 400,
      },
    ),
    NotFoundResponse(
      'Thrown when the assignee id does not belong to an existing user, or the project membership cannot be found',
      {
        message: 'Resource not found',
        error: 'Not Found',
        statusCode: 404,
      },
    ),
  );
}

export function FindAllTaskDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'List project tasks',
      description:
        'Returns a paginated list of tasks in the requested project with optional filtering and sorting.',
    }),
    ProjectMemberAuthDocs(),
    projectIdParam,
    PaginationQueryDocs(),
    ApiQuery({
      name: 'status',
      required: false,
      enum: TaskStatusEnum,
      description: 'Filter by task status',
    }),
    ApiQuery({
      name: 'title',
      required: false,
      type: String,
      example: 'release',
      description: 'Case-insensitive partial task-title filter',
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
      name: 'sortBy',
      required: false,
      enum: TaskSortField,
      example: TaskSortField.CREATED_AT,
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
      'Paginated project tasks returned',
      paginatedExample([taskExample]),
    ),
    BadRequestResponse('Thrown when query parameters fail validation', {
      message: ['page must not be less than 1'],
      error: 'Bad Request',
      statusCode: 400,
    }),
    NotFoundResponse(
      'Thrown when the authenticated user is not a member of the requested project',
      {
        message: 'Resource not found',
        error: 'Not Found',
        statusCode: 404,
      },
    ),
  );
}

export function FindOneTaskDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get project task by id' }),
    ProjectMemberAuthDocs(),
    projectIdParam,
    taskIdParam,
    OkResponse('Task returned', taskExample),
    NotFoundResponse(
      'Thrown when the task does not exist in the requested project, or the authenticated user is not a member of the project',
      {
        message: 'Task not found',
        error: 'Not Found',
        statusCode: 404,
      },
    ),
  );
}

export function UpdateTaskDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Update task by id' }),
    ProjectMemberAuthDocs(),
    projectIdParam,
    taskIdParam,
    ApiBody({ type: UpdateTaskDto }),
    OkResponse('Task updated', taskExample),
    BadRequestResponse(
      'Thrown when the request body is empty or none of the submitted task fields can be updated',
      {
        message: 'At least one of the fields must be provided.',
        error: 'Bad Request',
        statusCode: 400,
      },
    ),
    NotFoundResponse(
      'Thrown when the task does not exist, the assignee id does not belong to an existing user, or the project membership cannot be found',
      {
        message: 'Assignee not found',
        error: 'Not Found',
        statusCode: 404,
      },
    ),
  );
}

export function RemoveTaskDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete task by id' }),
    ProjectMemberAuthDocs(),
    projectIdParam,
    taskIdParam,
    OkResponse('Task deleted', { message: 'Task deleted' }),
  );
}
