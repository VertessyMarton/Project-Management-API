import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { UserModule } from './user/user.module';
import { EmailModule } from './email/email.module';
import { OtpModule } from './otp/otp.module';
import { Otp } from './otp/entities/otp.entity';
import { ProjectModule } from './project/project.module';
import { Project } from './project/entities/project.entity';
import { ProjectMembers } from './project/entities/project-members.entity';
import { TaskModule } from './task/task.module';
import { Task } from './task/entities/task.entity';
import { CommentModule } from './comment/comment.module';
import { Comment } from './comment/entities/comment.entity';
import { AdminModule } from './admin/admin.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { refreshToken } from './auth/entities/refresh-token.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: Number(configService.getOrThrow<number>('DB_PORT')),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_DATABASE'),
        ssl:
          configService.get<string>('DB_SSL') === 'true'
            ? { rejectUnauthorized: false }
            : false,
        entities: [
          User,
          Otp,
          Project,
          ProjectMembers,
          Task,
          Comment,
          refreshToken,
        ],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 1000,
      },
    ]),
    AuthModule,
    UserModule,
    EmailModule,
    OtpModule,
    ProjectModule,
    TaskModule,
    CommentModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
