import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

import { UpdateUserRoleDto } from 'src/admin/dto/update-user-role.dto';
import {
  AdminAuthDocs,
  BadRequestResponse,
  IdParam,
  NotFoundResponse,
  OkResponse,
} from './swagger-docs.helpers';
import { userExample } from './swagger-examples';

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
    ApiOperation({ summary: 'Admin get all users' }),
    AdminAuthDocs(),
    OkResponse('Users returned', [userExample]),
    NotFoundResponse('Thrown when no users can be found', {
      message: 'User not found',
      error: 'Not Found',
      statusCode: 404,
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
