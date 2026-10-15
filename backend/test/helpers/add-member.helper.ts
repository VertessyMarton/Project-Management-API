// test/helpers/auth.helper.ts

import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { createAuthenticatedUser } from './auth.helper';
import { ProjectRoleEnum } from 'src/project/enums/project-role.enum';

export const createProject = async (
  app: INestApplication,
  userRepository: Repository<User>,
) => {
  const owner = await createAuthenticatedUser(app, userRepository);
  const ownerAccessToken = owner.accessToken;

  const response = await request(app.getHttpServer())
    .post('/projects')
    .set('Authorization', `Bearer ${ownerAccessToken}`)
    .send({
      name: 'Test Project',
      description: 'description',
    })
    .expect(201);

  return {
    id: response.body.id,
    body: response.body,
    owner,
  };
};

export const addMemberToProject = async (
  app: INestApplication,
  userRepository: Repository<User>,
  role: ProjectRoleEnum,
) => {
  const project = await createProject(app, userRepository);
  const member = await createAuthenticatedUser(app, userRepository);
  const ownerAccessToken = project.owner.accessToken;

  await request(app.getHttpServer())
    .post(`/projects/${project.id}/members`)
    .set('Authorization', `Bearer ${ownerAccessToken}`)
    .send({
      email: member.user.email,
      role: role,
    })
    .expect(201);

  return {
    project,
    member,
    memberId: member.user.id,
    projectId: project.id,
    owner: project.owner,
    accessToken: member.accessToken,
  };
};
