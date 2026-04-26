import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

import { CreateTaskDto } from 'src/task/dto/create-task.dto';
import { UpdateTaskDto } from 'src/task/dto/update-task.dto';
import {
  BadRequestResponse,
  CreatedResponse,
  IdParam,
  NotFoundResponse,
  OkResponse,
  ProjectMemberAuthDocs,
} from './swagger-docs.helpers';
import { taskExample } from './swagger-examples';

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
    ApiOperation({ summary: 'Get project tasks' }),
    ProjectMemberAuthDocs(),
    projectIdParam,
    OkResponse('Project tasks returned', [taskExample]),
    NotFoundResponse(
      'Thrown when the project has no tasks, or the authenticated user is not a member of the project',
      {
        message: 'Task not found',
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
