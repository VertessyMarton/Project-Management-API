// test/helpers/auth.helper.ts

import request from 'supertest';
import { INestApplication } from '@nestjs/common';

const createTaskDto = () => {
  return {
    title: 'Prepare release notes',
    description: 'Summarize completed project work',
    status: 'todo',
    dueDate: '2026-05-01T10:30:00.000Z',
  };
};

export const createTask = async (
  app: INestApplication,
  token: string,
  projectId: number,
  httpCode: number,
) => {
  const task = createTaskDto();

  const response = await request(app.getHttpServer())
    .post(`/projects/${projectId}/tasks`)
    .set('Authorization', `Bearer ${token}`)
    .send(task)
    .expect(httpCode);

  return { taskId: response.body.id };
};
