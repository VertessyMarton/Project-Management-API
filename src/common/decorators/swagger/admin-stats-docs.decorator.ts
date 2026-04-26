import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { AdminAuthDocs, OkResponse } from './swagger-docs.helpers';

export function AdminStatsDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Admin get application statistics' }),
    AdminAuthDocs(),
    OkResponse('Application statistics returned', {
      users: 12,
      projects: 5,
      tasks: 37,
      comments: 84,
    }),
  );
}
