import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

export function AppRootDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get application health check' }),

    ApiOkResponse({
      description: 'Application is running',
      schema: {
        example: {
          status: 'ok',
          service: 'project-management-api',
          timestamp: '2026-05-19T12:00:00.000Z',
        },
      },
    }),
  );
}
