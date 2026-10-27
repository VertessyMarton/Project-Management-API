import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { Repository } from 'typeorm';
import type { UUID } from 'node:crypto';
import { AppModule } from '../src/app.module';
import { AuditLog } from '../src/audit-log/entities/aduit-log.entity';
import { EmailService } from '../src/email/email.service';
import { User } from '../src/user/entities/user.entity';
import { requestIdMiddleware } from '../src/common/middlewares/request-id.middleware';
import {
  createAuthenticatedAdmin,
  createAuthenticatedUser,
  registerVerifiedUser,
} from './helpers/auth.helper';

describe('Audit logs (e2e)', () => {
  let app: INestApplication;
  let users: Repository<User>;
  let logs: Repository<AuditLog>;
  let admin: Awaited<ReturnType<typeof createAuthenticatedAdmin>>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(EmailService)
      .useValue({ sendEmail: jest.fn().mockResolvedValue(undefined) })
      .compile();
    app = module.createNestApplication();
    app.use(requestIdMiddleware);
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    users = module.get(getRepositoryToken(User));
    logs = module.get(getRepositoryToken(AuditLog));
    await app.init();
    admin = await createAuthenticatedAdmin(app, users);
  });

  afterAll(async () => {
    await app?.close();
  });

  it('keeps deletion metadata after the target is deleted and correlates it to the request', async () => {
    const user = await registerVerifiedUser(app, users);
    const response = await request(app.getHttpServer())
      .delete(`/admin/users/${user.id}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);
    const requestId = response.headers['x-request-id'] as UUID;
    expect(requestId).toMatch(/^[0-9a-f-]{36}$/);
    expect(await users.findOneBy({ id: user.id })).toBeNull();
    const log = await logs.findOneBy({ requestId });
    expect(log).toMatchObject({
      action: 'admin.user.delete',
      actorId: admin.user.id,
      targetId: user.id,
      outcome: 'success',
      metadata: { name: user.name },
    });

    const result = await request(app.getHttpServer())
      .get('/admin/audit-logs')
      .query({ requestId, q: user.name })
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);
    expect(result.body.meta.total).toBe(1);
    expect(result.body.data[0].id).toBe(log!.id);
  });

  it('persists failure after a missing-user deletion rolls back', async () => {
    const targetId = 2147483647;
    const response = await request(app.getHttpServer())
      .delete(`/admin/users/${targetId}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(404);
    const events = await logs.findBy({
      requestId: response.headers['x-request-id'] as UUID,
    });
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      targetId,
      outcome: 'failure',
      action: 'admin.user.delete',
    });
  });

  it('restricts audit access to global admins', async () => {
    await request(app.getHttpServer()).get('/admin/audit-logs').expect(401);
    const user = await createAuthenticatedUser(app, users);
    await request(app.getHttpServer())
      .get('/admin/audit-logs')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(403);
  });
});
