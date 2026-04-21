import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProjectMembers } from './entities/project-members.entity';
import { User } from 'src/user/entities/user.entity';
import { ProjectRolesGuard } from 'src/common/guards/project-roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectMembers, User])],
  controllers: [ProjectController],
  providers: [ProjectService, ProjectRolesGuard],
})
export class ProjectModule {}
