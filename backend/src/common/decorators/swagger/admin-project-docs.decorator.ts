import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

import {
  AdminProjectSortField,
  SortOrder,
} from 'src/admin/dto/admin.project-query.dto';
import {
  AdminAuthDocs,
  BadRequestResponse,
  IdParam,
  NotFoundResponse,
  OkResponse,
  PaginationQueryDocs,
} from './swagger-docs.helpers';
import { paginatedExample, projectExample } from './swagger-examples';

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
    ApiOperation({
      summary: 'Admin list projects',
      description:
        'Returns a paginated list of projects with optional searching, filtering, and sorting.',
    }),
    AdminAuthDocs(),
    PaginationQueryDocs(),
    ApiQuery({
      name: 'q',
      required: false,
      type: String,
      example: 'website',
      description:
        'Case-insensitive search across project name and description',
    }),
    ApiQuery({
      name: 'memberId',
      required: false,
      type: Number,
      example: 2,
      description: 'Return only projects containing this user as a member',
    }),
    ApiQuery({
      name: 'createdFrom',
      required: false,
      type: String,
      example: '2026-04-01',
      description:
        'Return projects created on or after this ISO date or timestamp',
    }),
    ApiQuery({
      name: 'createdTo',
      required: false,
      type: String,
      example: '2026-04-30',
      description:
        'Return projects created through this ISO date or timestamp. A date-only value includes the entire day',
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      enum: AdminProjectSortField,
      example: AdminProjectSortField.CREATED_AT,
      description: 'Field used to sort the projects',
    }),
    ApiQuery({
      name: 'sortOrder',
      required: false,
      enum: SortOrder,
      example: SortOrder.DESC,
      description: 'Sort direction',
    }),
    OkResponse(
      'Paginated projects returned',
      paginatedExample([projectExample]),
    ),
    BadRequestResponse('Thrown when query parameters fail validation', {
      message: ['createdFrom must be a valid ISO 8601 date string'],
      error: 'Bad Request',
      statusCode: 400,
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
