import { Module, ParseIntPipe } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { ProjectService } from 'src/project/project.service';
import { ProjectRolesGuard } from 'src/common/guards/project-roles.guard';
import { Project } from 'src/project/entities/project.entity';
import { ProjectMembers } from 'src/project/entities/project-members.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Project, ProjectMembers, User])],
  controllers: [TaskController],
  providers: [TaskService, ProjectRolesGuard, ParseIntPipe],
})
export class TaskModule {}
