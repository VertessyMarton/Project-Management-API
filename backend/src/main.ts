import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import type { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const publicDirectory = join(__dirname, '..', 'public');
  const indexFile = join(publicDirectory, 'index.html');
  if (existsSync(indexFile)) {
    app.useStaticAssets(publicDirectory, { index: false });
    app.use((req: Request, res: Response, next: NextFunction) => {
      const isBackendRoute = /^\/(api|docs)(\/|$)/.test(req.path);
      if (
        (req.method === 'GET' || req.method === 'HEAD') &&
        !isBackendRoute &&
        !extname(req.path) &&
        req.accepts('html')
      ) {
        return res.sendFile(indexFile);
      }
      next();
    });
  }

  app.use(helmet());

  app.enableCors({
    origin: [
      'http://localhost:4200',
      ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
    ],
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Project Manager API')
    .setDescription(
      'REST API for managing projects, tasks, comments, and admin actions',
    )
    .setVersion('1.0')
    .addServer('/api')
    .addBearerAuth()
    .addCookieAuth('refreshToken')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
