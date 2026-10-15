import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { createProject } from './helpers/add-member.helper';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmailService } from 'src/email/email.service';
import { createTask } from './helpers/task.helper';
import {
  createAuthenticatedAdmin,
  createAuthenticatedUser,
  registerVerifiedUser,
} from './helpers/auth.helper';
import { UserRoleEnum } from 'src/user/enums/user-role.enum';

let userRepository: Repository<User>;

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailService)
      .useValue({
        sendEmail: jest.fn().mockResolvedValue(undefined),
      })
      .compile();

    app = moduleRef.createNestApplication();

    userRepository = moduleRef.get<Repository<User>>(getRepositoryToken(User));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Admin can view all user', async () => {
    const admin = await createAuthenticatedAdmin(app, userRepository);
    const adminAccessToken = admin.accessToken;

    await request(app.getHttpServer())
      .get(`/admin/users`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);
  });

  it('Admin can view all projects', async () => {
    const admin = await createAuthenticatedAdmin(app, userRepository);
    const adminAccessToken = admin.accessToken;

    await request(app.getHttpServer())
      .get(`/admin/projects`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);
  });

  it('Admin can view all tasks', async () => {
    const admin = await createAuthenticatedAdmin(app, userRepository);
    const adminAccessToken = admin.accessToken;

    await request(app.getHttpServer())
      .get(`/admin/tasks`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);
  });

  it('Admin can view all comments', async () => {
    const admin = await createAuthenticatedAdmin(app, userRepository);
    const adminAccessToken = admin.accessToken;

    await request(app.getHttpServer())
      .get(`/admin/comments`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);
  });

  it('User cannot view all projects', async () => {
    const user = await createAuthenticatedUser(app, userRepository);
    const userAccessToken = user.accessToken;

    await request(app.getHttpServer())
      .get(`/admin/project`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .expect(404);
  });

  it('unauthenticated user cannot access endpoint', async () => {
    await request(app.getHttpServer()).get(`/admin/project`).expect(404);
  });

  it('Admin can delete user', async () => {
    const user = await registerVerifiedUser(app, userRepository);
    const admin = await createAuthenticatedAdmin(app, userRepository);
    const adminAccessToken = admin.accessToken;

    await request(app.getHttpServer())
      .delete(`/admin/users/${user.id}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);
  });

  it('User can delete other users', async () => {
    const userToBeDeleted = await registerVerifiedUser(app, userRepository);
    const user = await createAuthenticatedUser(app, userRepository);
    const userAccessToken = user.accessToken;

    await request(app.getHttpServer())
      .delete(`/admin/users/${userToBeDeleted.id}`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .expect(403);
  });

  it('Admin update user role', async () => {
    const user = await registerVerifiedUser(app, userRepository);
    const admin = await createAuthenticatedAdmin(app, userRepository);
    const adminAccessToken = admin.accessToken;

    await request(app.getHttpServer())
      .patch(`/admin/users/${user.id}/role`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        role: UserRoleEnum.ADMIN,
      })
      .expect(200);
  });

  it('Admin can view stats', async () => {
    const admin = await createAuthenticatedAdmin(app, userRepository);
    const adminAccessToken = admin.accessToken;

    await request(app.getHttpServer())
      .get(`/admin/stats`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);
  });
});
