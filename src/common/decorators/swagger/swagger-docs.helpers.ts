import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export const accessTokenInvalidDescription =
  'Thrown when the access token is missing, expired, malformed, or invalid';

export function OkResponse(description: string, example: unknown) {
  return ApiOkResponse({
    description,
    schema: { example },
  });
}

export function CreatedResponse(description: string, example: unknown) {
  return ApiCreatedResponse({
    description,
    schema: { example },
  });
}

export function BadRequestResponse(description: string, example: unknown) {
  return ApiBadRequestResponse({
    description,
    schema: { example },
  });
}

export function UnauthorizedResponse(description: string, example: unknown) {
  return ApiUnauthorizedResponse({
    description,
    schema: { example },
  });
}

export function NotFoundResponse(description: string, example: unknown) {
  return ApiNotFoundResponse({
    description,
    schema: { example },
  });
}

export function ForbiddenResponse(description: string, example: unknown) {
  return ApiForbiddenResponse({
    description,
    schema: { example },
  });
}

export function IdParam(name: string, description: string) {
  return ApiParam({
    name,
    example: 1,
    description,
  });
}

export function JwtUnauthorizedResponse() {
  return ApiUnauthorizedResponse({
    description: accessTokenInvalidDescription,
    schema: {
      example: {
        message: 'Unauthorized',
        statusCode: 401,
      },
    },
  });
}

export function BearerAuthDocs() {
  return applyDecorators(ApiBearerAuth(), JwtUnauthorizedResponse());
}

export function AdminAuthDocs() {
  return applyDecorators(
    BearerAuthDocs(),
    ForbiddenResponse(
      'Thrown when the authenticated user does not have the admin role',
      {
        message: 'Forbidden resource',
        error: 'Forbidden',
        statusCode: 403,
      },
    ),
  );
}

export function ProjectMemberAuthDocs() {
  return applyDecorators(
    BearerAuthDocs(),
    ForbiddenResponse(
      'Thrown when the authenticated project member does not have one of the required project roles',
      {
        message: 'Forbidden resource',
        error: 'Forbidden',
        statusCode: 403,
      },
    ),
  );
}
