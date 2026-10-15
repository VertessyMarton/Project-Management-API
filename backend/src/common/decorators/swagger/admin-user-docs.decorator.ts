import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery } from '@nestjs/swagger';

import {
  AdminUserSortField,
  SortOrder,
} from 'src/admin/dto/admin.user-query.dto';
import { UpdateUserRoleDto } from 'src/admin/dto/update-user-role.dto';
import { UserRoleEnum } from 'src/user/enums/user-role.enum';
import { UserStatusEnum } from 'src/user/enums/user-status.enum';
import {
  AdminAuthDocs,
  BadRequestResponse,
  IdParam,
  NotFoundResponse,
  OkResponse,
  PaginationQueryDocs,
} from './swagger-docs.helpers';
import { paginatedExample, userExample } from './swagger-examples';

const userIdParam = IdParam('userId', 'User id');
const userNotFound = NotFoundResponse(
  'Thrown when no user exists with the provided userId',
  {
    message: 'User not found',
    error: 'Not Found',
    statusCode: 404,
  },
);

export function AdminFindAllUsersDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Admin list users',
      description:
        'Returns a paginated list of users with optional searching, filtering, and sorting.',
    }),
    AdminAuthDocs(),
    PaginationQueryDocs(),
    ApiQuery({
      name: 'q',
      required: false,
      type: String,
      example: 'test',
      description: 'Case-insensitive search across user name and email',
    }),
    ApiQuery({
      name: 'role',
      required: false,
      enum: UserRoleEnum,
      description: 'Filter by global user role',
    }),
    ApiQuery({
      name: 'status',
      required: false,
      enum: UserStatusEnum,
      description: 'Filter by user verification status',
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      enum: AdminUserSortField,
      example: AdminUserSortField.CREATED_AT,
      description: 'Field used to sort the users',
    }),
    ApiQuery({
      name: 'sortOrder',
      required: false,
      enum: SortOrder,
      example: SortOrder.DESC,
      description: 'Sort direction',
    }),
    OkResponse('Paginated users returned', paginatedExample([userExample])),
    BadRequestResponse('Thrown when query parameters fail validation', {
      message: ['page must not be less than 1'],
      error: 'Bad Request',
      statusCode: 400,
    }),
  );
}

export function AdminFindOneUserDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Admin get user by id' }),
    AdminAuthDocs(),
    userIdParam,
    OkResponse('User returned', userExample),
    userNotFound,
  );
}

export function AdminSetUserRoleDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Admin update user role' }),
    AdminAuthDocs(),
    userIdParam,
    ApiBody({ type: UpdateUserRoleDto }),
    OkResponse('User role updated', { ...userExample, role: 'admin' }),
    BadRequestResponse(
      'Thrown when the submitted role is missing or is not a valid user role',
      {
        message: ['role must be one of the following values: user, admin'],
        error: 'Bad Request',
        statusCode: 400,
      },
    ),
    userNotFound,
  );
}

export function AdminDeleteUserDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Admin delete user by id' }),
    AdminAuthDocs(),
    userIdParam,
    OkResponse('User deleted', { message: 'user deleted' }),
    userNotFound,
  );
}
