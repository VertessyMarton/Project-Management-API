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

  const createComment = async (
    projectId: number,
    taskId: number,
    token: string,
    httpCode: number,
  ) => {
    const response = await request(app.getHttpServer())
      .post(`/projects/${projectId}/tasks/${taskId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: 'test comment',
      })
      .expect(httpCode);

    return { commentId: response.body.id };
  };

  it('owner of project can comment on task', async () => {
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

    await createComment(
      project.projectId,
      task.taskId,
      project.owner.accessToken,
      201,
    );
  });

  it('member of project can comment on task', async () => {
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

    await createComment(
      project.projectId,
      task.taskId,
      project.member.accessToken,
      201,
    );
  });

  it('viewer of project can comment on task', async () => {
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

    await createComment(
      project.projectId,
      task.taskId,
      project.member.accessToken,
      201,
    );
  });

  it('non-member cannot comment on task', async () => {
    const nonMember = await createAuthenticatedUser(app, userRepository);
    const nonMemberToken = nonMember.accessToken;
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

    await createComment(project.projectId, task.taskId, nonMemberToken, 404);
  });

  it('author can update own comment', async () => {
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

    const comment = await createComment(
      project.projectId,
      task.taskId,
      project.member.accessToken,
      201,
    );

    request(app.getHttpServer())
      .patch(
        `/projects/${project.projectId}/tasks/${task.taskId}/comments/${comment.commentId}`,
      )
      .set('Authorization', `Bearer ${project.member.accessToken}`)
      .send({
        content: 'Updated comment',
      })
      .expect(200);
  });

  it('member of project cannot update other comments', async () => {
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

    const comment = await createComment(
      project.projectId,
      task.taskId,
      project.owner.accessToken,
      201,
    );

    request(app.getHttpServer())
      .patch(
        `/projects/${project.projectId}/tasks/${task.taskId}/comments/${comment.commentId}`,
      )
      .set('Authorization', `Bearer ${project.member.accessToken}`)
      .send({
        content: 'Updated comment',
      })
      .expect(401);
  });

  it('non-member cannot view on task', async () => {
    const nonMember = await createAuthenticatedUser(app, userRepository);
    const nonMemberToken = nonMember.accessToken;
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

    await createComment(
      project.projectId,
      task.taskId,
      project.owner.accessToken,
      201,
    );

    request(app.getHttpServer())
      .get(`/projects/${project.projectId}/tasks/${task.taskId}/comments`)
      .set('Authorization', `Bearer ${nonMemberToken}`)
      .expect(403);
  });
});
