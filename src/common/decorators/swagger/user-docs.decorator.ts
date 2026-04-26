import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

import { UpdateMeDto } from 'src/user/dto/update-me.dto';
import {
  BadRequestResponse,
  BearerAuthDocs,
  IdParam,
  NotFoundResponse,
  OkResponse,
} from './swagger-docs.helpers';
import { userExample } from './swagger-examples';

export function GetMeDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get authenticated user profile' }),
    BearerAuthDocs(),
    OkResponse('Authenticated user profile returned', userExample),
  );
}

export function GetUserDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get user profile by id' }),
    BearerAuthDocs(),
    IdParam('id', 'User id'),
    OkResponse('User profile returned', userExample),
    NotFoundResponse(
      'Thrown when the requested user does not exist, or the requested user is an admin account hidden from this endpoint',
      {
        message: 'User not found',
        error: 'Not Found',
        statusCode: 404,
      },
    ),
  );
}

export function UpdateMeDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Update authenticated user profile' }),
    BearerAuthDocs(),
    ApiBody({ type: UpdateMeDto }),
    OkResponse('Authenticated user profile updated', userExample),
    BadRequestResponse(
      'Thrown when the submitted profile fields fail validation',
      {
        message: ['name must be shorter than or equal to 100 characters'],
        error: 'Bad Request',
        statusCode: 400,
      },
    ),
  );
}
