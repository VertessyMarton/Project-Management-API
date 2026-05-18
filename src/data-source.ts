// src/data-source.ts
import 'dotenv/config';
import { DataSource } from 'typeorm';

import { User } from './user/entities/user.entity';
import { Otp } from './otp/entities/otp.entity';
import { Project } from './project/entities/project.entity';
import { ProjectMembers } from './project/entities/project-members.entity';
import { Task } from './task/entities/task.entity';
import { Comment } from './comment/entities/comment.entity';

const getEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const dbPort = Number(getEnv('DB_PORT'));

if (Number.isNaN(dbPort)) {
  throw new Error('DB_PORT must be a valid number');
}

export default new DataSource({
  type: 'postgres',
  host: getEnv('DB_HOST'),
  port: dbPort,
  username: getEnv('DB_USERNAME'),
  password: getEnv('DB_PASSWORD'),
  database: getEnv('DB_DATABASE'),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: [User, Otp, Project, ProjectMembers, Task, Comment],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});
