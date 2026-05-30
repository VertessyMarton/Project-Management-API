import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createAuthenticatedUser } from './helpers/auth.helper';
import { addMemberToProject, createProject } from './helpers/add-member.helper';
import { EmailService } from 'src/email/email.service';
import { ProjectRoleEnum } from 'src/project/enums/project-role.enum';

let userRepository: Repository<User>;

describe('Project (e2e)', () => {
  let app: INestApplication;

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

  it('unauthenticated user cannot create project', async () => {
    await request(app.getHttpServer())
      .post('/projects')
      .send({
        name: 'Test Project',
        description: 'description',
      })
      .expect(401);
  });

  it('verified user can create project', async () => {
    const project = await createProject(app, userRepository);
  });

  it('owner can view project', async () => {
    const project = await createProject(app, userRepository);

    await request(app.getHttpServer())
      .get(`/projects/${project.id}`)
      .set('Authorization', `Bearer ${project.owner.accessToken}`)
      .expect(200);
  });

  it('non-member cannot view project', async () => {
    const project = await createProject(app, userRepository);
    const nonMember = await createAuthenticatedUser(app, userRepository);
    const nonMenberAccessToken = nonMember.accessToken;

    await request(app.getHttpServer())
      .get(`/projects/${project.id}`)
      .set('Authorization', `Bearer ${nonMenberAccessToken}`)
      .expect(404);
  });

  it('owner can update project', async () => {
    const project = await createProject(app, userRepository);

    await request(app.getHttpServer())
      .patch(`/projects/${project.id}`)
      .set('Authorization', `Bearer ${project.owner.accessToken}`)
      .send({
        name: 'Updated Test Project',
        description: 'Updated description',
      })
      .expect(200);
  });

  it('member cannot update project', async () => {
    const member = await addMemberToProject(
      app,
      userRepository,
      ProjectRoleEnum.MEMBER,
    );

    await request(app.getHttpServer())
      .patch(`/projects/${member.project.id}`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .send({
        name: 'Updated Test Project',
        description: 'Updated description',
      })
      .expect(403);
  });

  it('member cannot delete project', async () => {
    const member = await addMemberToProject(
      app,
      userRepository,
      ProjectRoleEnum.MEMBER,
    );

    await request(app.getHttpServer())
      .delete(`/projects/${member.project.id}`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .expect(403);
  });

  it('owner can delete project', async () => {
    const project = await createProject(app, userRepository);

    await request(app.getHttpServer())
      .delete(`/projects/${project.id}`)
      .set('Authorization', `Bearer ${project.owner.accessToken}`)
      .expect(200);
  });
});
