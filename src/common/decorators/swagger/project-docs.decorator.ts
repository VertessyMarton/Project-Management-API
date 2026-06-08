import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

import { AddMemberDto } from 'src/project/dto/add-member.dto';
import { CreateProjectDto } from 'src/project/dto/create-project.dto';
import { UpdateProjectDto } from 'src/project/dto/update-project.dto';
import {
  BadRequestResponse,
  BearerAuthDocs,
  CreatedResponse,
  ForbiddenResponse,
  IdParam,
  NotFoundResponse,
  OkResponse,
} from './swagger-docs.helpers';
import { projectExample, projectMemberExample } from './swagger-examples';
import { RemoveMemberDto } from 'src/project/dto/remove-member.dto';

const projectIdParam = IdParam('projectId', 'Project id');
const projectNotFound = NotFoundResponse(
  'Thrown when the project does not exist or does not belong to the authenticated user',
  {
    message: 'Project not found',
    error: 'Not Found',
    statusCode: 404,
  },
);

export function CreateProjectDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a project' }),
    BearerAuthDocs(),
    ApiBody({ type: CreateProjectDto }),
    CreatedResponse('Project created', projectExample),
    BadRequestResponse(
      'Thrown when the submitted project fields fail validation',
      {
        message: ['name should not be empty'],
        error: 'Bad Request',
        statusCode: 400,
      },
    ),
  );
}

export function GetProjectDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get project by id' }),
    BearerAuthDocs(),
    projectIdParam,
    OkResponse('Project returned', projectExample),
    projectNotFound,
  );
}

export function GetAllProjectDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get authenticated user projects' }),
    BearerAuthDocs(),
    OkResponse('Projects returned', [projectExample]),
  );
}

export function RemoveProjectDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete project by id' }),
    BearerAuthDocs(),
    projectIdParam,
    OkResponse('Project deleted', { message: 'Project deleted' }),
    projectNotFound,
  );
}

export function UpdateProjectDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Update project by id' }),
    BearerAuthDocs(),
    projectIdParam,
    ApiBody({ type: UpdateProjectDto }),
    OkResponse('Project updated', projectExample),
    BadRequestResponse(
      'Thrown when the request body is empty or none of the submitted project fields can be updated',
      {
        message: 'At least one of name or description must be provided.',
        error: 'Bad Request',
        statusCode: 400,
      },
    ),
    projectNotFound,
  );
}

export function AddProjectMemberDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Add member to project' }),
    BearerAuthDocs(),
    projectIdParam,
    ApiBody({ type: AddMemberDto }),
    CreatedResponse('Project member added', projectMemberExample),
    BadRequestResponse(
      'Thrown when the request body fails validation or the invited email does not belong to an existing user',
      {
        message: 'User cannot be added to project',
        error: 'Bad Request',
        statusCode: 400,
      },
    ),
    ForbiddenResponse(
      'Thrown when the invited user is already a project member, or the authenticated user is not allowed to add members',
      {
        message: 'Cannot add user to the project',
        error: 'Forbidden',
        statusCode: 403,
      },
    ),
  );
}

export function RemoveProjectMemberDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Remove member from project' }),
    BearerAuthDocs(),
    projectIdParam,
    ApiBody({ type: RemoveMemberDto }),
    OkResponse('Project member removed', projectMemberExample),
    BadRequestResponse(
      'Thrown when the request body fails validation or the invited email does not belong to an existing user',
      {
        message: 'User cannot be removed from the project',
        error: 'Bad Request',
        statusCode: 400,
      },
    ),
    ForbiddenResponse(
      'Thrown when the user is not a member of the project, or the authenticated user is not allowed to add members',
      {
        message: 'Cannot remove user from the project',
        error: 'Forbidden',
        statusCode: 403,
      },
    ),
  );
}
