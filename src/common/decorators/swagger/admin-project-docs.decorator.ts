import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import {
  AdminAuthDocs,
  IdParam,
  NotFoundResponse,
  OkResponse,
} from './swagger-docs.helpers';
import { projectExample } from './swagger-examples';

const projectIdParam = IdParam('projectId', 'Project id');
const projectNotFound = NotFoundResponse(
  'Thrown when no project exists with the provided projectId',
  {
    message: 'Project not found',
    error: 'Not Found',
    statusCode: 404,
  },
);

export function AdminFindAllProjectDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Admin get all projects' }),
    AdminAuthDocs(),
    OkResponse('Projects returned', [projectExample]),
    NotFoundResponse('Thrown when no projects can be found', {
      message: 'Project not found',
      error: 'Not Found',
      statusCode: 404,
    }),
  );
}

export function AdminFindOneProjectDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Admin get project by id' }),
    AdminAuthDocs(),
    projectIdParam,
    OkResponse('Project returned', projectExample),
    projectNotFound,
  );
}

export function AdminDeleteProjectDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Admin delete project by id' }),
    AdminAuthDocs(),
    projectIdParam,
    OkResponse('Project deleted', { message: 'Project deleted' }),
    projectNotFound,
  );
}
