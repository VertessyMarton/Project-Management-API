import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

export function AppRootDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get application welcome message' }),

    ApiOkResponse({
      description: 'Application welcome message returned',
      schema: {
        example: 'Hello World!',
      },
    }),
  );
}
