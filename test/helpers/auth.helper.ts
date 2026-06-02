// test/helpers/auth.helper.ts

import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { createUserDto } from './user.helper';
import { UserRoleEnum } from 'src/user/enums/user-role.enum';

export type CookieHeader = string | string[] | undefined;

export const toCookieArray = (cookies: CookieHeader) =>
  Array.isArray(cookies) ? cookies : cookies ? [cookies] : [];

export const findRefreshCookie = (cookies: CookieHeader) =>
  toCookieArray(cookies).find((cookie) => cookie.startsWith('refreshToken='));

export const registerVerifiedUser = async (
  app: INestApplication,
  userRepository: Repository<User>,
) => {
  const user = createUserDto();

  const response = await request(app.getHttpServer())
    .post('/auth/register')
    .send(user)
    .expect(201);

  await userRepository.update({ email: user.email }, { status: 'verified' });

  return response.body;
};

export const createAuthenticatedUser = async (
  app: INestApplication,
  userRepository: Repository<User>,
) => {
  const user = await registerVerifiedUser(app, userRepository);

  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      email: user.email,
      password: 'Password123!',
    })
    .expect(200);

  return {
    user,
    accessToken: response.body.accessToken,
    refreshCookie: findRefreshCookie(response.headers['set-cookie']),
  };
};

export const createAuthenticatedAdmin = async (
  app: INestApplication,
  userRepository: Repository<User>,
) => {
  const user = await registerVerifiedUser(app, userRepository);

  await userRepository.update(
    { email: user.email },
    { role: UserRoleEnum.ADMIN },
  );

  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      email: user.email,
      password: 'Password123!',
    })
    .expect(200);

  return {
    user,
    accessToken: response.body.accessToken,
    refreshCookie: findRefreshCookie(response.headers['set-cookie']),
  };
};
