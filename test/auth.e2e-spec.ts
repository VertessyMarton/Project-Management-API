import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createUserDto } from './helpers/user.helper';
import { EmailService } from 'src/email/email.service';

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
    expect(response.body.refreshToken).toBeDefined();
    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe(user.email);
  });

  it('rejects an invalid refresh token', async () => {
    const wrongRefreshToken = 'wrongToken';

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${wrongRefreshToken}`)
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

    const refreshToken = loginResponse.body.refreshToken;

    expect(refreshToken).toBeDefined();

    const refreshResponse = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${refreshToken}`)
      .expect(200);

    expect(refreshResponse.body.accessToken).toBeDefined();
  });
});
