import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { addMemberToProject, createProject } from './helpers/add-member.helper';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmailService } from 'src/email/email.service';
import { ProjectRoleEnum } from 'src/project/enums/project-role.enum';
import { createTask } from './helpers/task.helper';
import { createAuthenticatedUser } from './helpers/auth.helper';

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

  it('owner of project can create task', async () => {
    const project = await createProject(app, userRepository);

    await createTask(app, project.owner.accessToken, project.id, 201);
  });

  it('member of project can create task', async () => {
    const project = await addMemberToProject(
      app,
      userRepository,
      ProjectRoleEnum.MEMBER,
    );

    await createTask(app, project.member.accessToken, project.projectId, 201);
  });

  it('viewer of project cannot create task', async () => {
    const project = await addMemberToProject(
      app,
      userRepository,
      ProjectRoleEnum.VIEWER,
    );

    await createTask(app, project.member.accessToken, project.projectId, 403);
  });

  it('member of project can update task', async () => {
    const project = await addMemberToProject(
      app,
      userRepository,
      ProjectRoleEnum.MEMBER,
    );

    const task = await createTask(
      app,
      project.owner.accessToken,
      project.projectId,
      201,
    );

    await request(app.getHttpServer())
      .patch(`/projects/${project.projectId}/tasks/${task.taskId}`)
      .set('Authorization', `Bearer ${project.member.accessToken}`)
      .send({
        assignee: project.memberId,
      })
      .expect(200);
  });

  it('member of project can delete task', async () => {
    const project = await addMemberToProject(
      app,
      userRepository,
      ProjectRoleEnum.MEMBER,
    );

    const task = await createTask(
      app,
      project.owner.accessToken,
      project.projectId,
      201,
    );

    await request(app.getHttpServer())
      .delete(`/projects/${project.projectId}/tasks/${task.taskId}`)
      .set('Authorization', `Bearer ${project.member.accessToken}`)
      .expect(200);
  });

  it('viewer of project cannot delete task', async () => {
    const project = await addMemberToProject(
      app,
      userRepository,
      ProjectRoleEnum.VIEWER,
    );

    const task = await createTask(
      app,
      project.owner.accessToken,
      project.projectId,
      201,
    );

    await request(app.getHttpServer())
      .delete(`/projects/${project.projectId}/tasks/${task.taskId}`)
      .set('Authorization', `Bearer ${project.member.accessToken}`)
      .expect(403);
  });

  it('viewer of project can view all tasks', async () => {
    const project = await addMemberToProject(
      app,
      userRepository,
      ProjectRoleEnum.VIEWER,
    );

    await createTask(app, project.owner.accessToken, project.projectId, 201);

    await request(app.getHttpServer())
      .get(`/projects/${project.projectId}/tasks`)
      .set('Authorization', `Bearer ${project.member.accessToken}`)
      .expect(200);
  });

  it('viewer of project can view single task', async () => {
    const project = await addMemberToProject(
      app,
      userRepository,
      ProjectRoleEnum.VIEWER,
    );

    const task = await createTask(
      app,
      project.owner.accessToken,
      project.projectId,
      201,
    );

    await request(app.getHttpServer())
      .get(`/projects/${project.projectId}/tasks/${task.taskId}`)
      .set('Authorization', `Bearer ${project.member.accessToken}`)
      .expect(200);
  });

  it('Non-member cannot delete task', async () => {
    const nonMember = await createAuthenticatedUser(app, userRepository);
    const nonMemberToken = nonMember.accessToken;
    const project = await createProject(app, userRepository);

    const task = await createTask(
      app,
      project.owner.accessToken,
      project.id,
      201,
    );

    await request(app.getHttpServer())
      .delete(`/projects/${project.id}/tasks/${task.taskId}`)
      .set('Authorization', `Bearer ${nonMemberToken}`)
      .expect(404);
  });

  it('Non-member cannot update task', async () => {
    const nonMember = await createAuthenticatedUser(app, userRepository);
    const nonMemberToken = nonMember.accessToken;
    const project = await createProject(app, userRepository);

    const task = await createTask(
      app,
      project.owner.accessToken,
      project.id,
      201,
    );

    await request(app.getHttpServer())
      .patch(`/projects/${project.id}/tasks/${task.taskId}`)
      .set('Authorization', `Bearer ${nonMemberToken}`)
      .send({
        title: 'new title',
      })
      .expect(404);
  });
});
