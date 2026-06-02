import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createUserDto } from './helpers/user.helper';
import { EmailService } from 'src/email/email.service';
import cookieParser from 'cookie-parser';
import {
  createAuthenticatedUser,
  findRefreshCookie,
  toCookieArray,
} from './helpers/auth.helper';

let userRepository: Repository<User>;

describe('Auth (e2e)', () => {
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

    app.use(cookieParser());

    userRepository = moduleRef.get<Repository<User>>(getRepositoryToken(User));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers user', async () => {
    const user = createUserDto();

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(user)
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.email).toBe(user.email);
  });

  it('rejects duplicate email', async () => {
    const user = createUserDto();

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(user)
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(user)
      .expect(400);
  });

  it('Wrong password fails', async () => {
    const user = createUserDto();

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(user)
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: user.email,
        password: 'wrongPassword',
      })
      .expect(401);
  });

  it('Unverified user cannot login', async () => {
    const user = createUserDto();

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(user)
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: user.email,
        password: user.password,
      })
      .expect(401);
  });

  it('Verified user can login', async () => {
    const user = createUserDto();

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(user)
      .expect(201);

    await userRepository.update({ email: user.email }, { status: 'verified' });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: user.email,
        password: user.password,
      })
      .expect(200);

    expect(response.body.accessToken).toBeDefined();
    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe(user.email);

    const cookies = response.headers['set-cookie'];
    expect(cookies).toBeDefined();
  });

  it('rejects an invalid refresh token', async () => {
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', `refreshToken=wrongToken`)
      .expect(401);
  });

  it('refreshes the access token', async () => {
    const user = createUserDto();

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(user)
      .expect(201);

    await userRepository.update({ email: user.email }, { status: 'verified' });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: user.email,
        password: user.password,
      })
      .expect(200);

    const cookies = toCookieArray(loginResponse.headers['set-cookie']);

    expect(cookies).toBeDefined();

    const refreshResponse = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', cookies)
      .expect(200);

    expect(refreshResponse.body.accessToken).toBeDefined();

    const rotatedCookies = refreshResponse.headers['set-cookie'];
    expect(rotatedCookies).toBeDefined();
  });

  it('logs in, refreshes, logs out, and rejects refresh after logout', async () => {
    const user = await createAuthenticatedUser(app, userRepository);
    const loginRefreshCookie = user.refreshCookie;

    expect(user.accessToken).toBeDefined();
    expect(loginRefreshCookie).toBeDefined();
    expect(loginRefreshCookie).toContain('HttpOnly');

    const refreshResponse = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', loginRefreshCookie!)
      .expect(200);

    expect(refreshResponse.body.accessToken).toBeDefined();
    expect(refreshResponse.body.id).toBeDefined();

    const rotatedRefreshCookie = findRefreshCookie(
      refreshResponse.headers['set-cookie'],
    );

    expect(rotatedRefreshCookie).toBeDefined();
    expect(rotatedRefreshCookie).not.toBe(loginRefreshCookie);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', loginRefreshCookie!)
      .expect(401);

    const logoutResponse = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Cookie', rotatedRefreshCookie!)
      .expect(200);

    expect(logoutResponse.body).toEqual({ message: 'Token revoked' });

    const clearedRefreshCookie = toCookieArray(
      logoutResponse.headers['set-cookie'],
    ).find(
      (cookie) =>
        cookie.startsWith('refreshToken=') && cookie.includes('Path=/api/auth'),
    );

    expect(clearedRefreshCookie).toBeDefined();
    expect(clearedRefreshCookie).toMatch(/Expires=Thu, 01 Jan 1970|Max-Age=0/);

    await request(app.getHttpServer()).post('/auth/refresh').expect(401);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', rotatedRefreshCookie!)
      .expect(401);
  });
});
