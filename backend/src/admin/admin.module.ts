import { Module } from '@nestjs/common';
import { AdminUserController } from './controllers/admin-user.controller';
import { AdminProjectController } from './controllers/admin-project.controller';
import { AdminTaskController } from './controllers/admin-task.controller';
import { AdminCommentController } from './controllers/admin-comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Project } from 'src/project/entities/project.entity';
import { Task } from 'src/task/entities/task.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AdminStatController } from './controllers/admin-stats.controller';
import { AdminUserService } from './services/admin-user.service';
import { AdminProjectService } from './services/admin-project.service';
import { AdminTaskService } from './services/admin-task.service';
import { AdminCommentService } from './services/admin-comment.service';
import { AdminStatsService } from './services/admin-stats.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Project, Task, Comment])],
  controllers: [
    AdminUserController,
    AdminProjectController,
    AdminTaskController,
    AdminCommentController,
    AdminStatController,
  ],
  providers: [
    AdminUserService,
    AdminProjectService,
    AdminTaskService,
    AdminCommentService,
    AdminStatsService,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class AdminModule {}
