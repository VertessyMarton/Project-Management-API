import { Module, ParseIntPipe } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { User } from 'src/user/entities/user.entity';
import { Task } from 'src/task/entities/task.entity';
import { ProjectMembers } from 'src/project/entities/project-members.entity';
import { ProjectRolesGuard } from 'src/common/guards/project-roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, User, Task, ProjectMembers])],
  controllers: [CommentController],
  providers: [CommentService, ProjectRolesGuard, ParseIntPipe],
})
export class CommentModule {}
