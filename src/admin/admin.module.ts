import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminUserController } from './controllers/admin-user.controller';
import { AdminProjectController } from './controllers/admin-project.controller';
import { AdminTaskUserController } from './controllers/admin-task.controller';
import { AdminCommentController } from './controllers/admin-comment.controller';

@Module({
  controllers: [
    AdminUserController,
    AdminProjectController,
    AdminTaskUserController,
    AdminCommentController,
  ],
  providers: [AdminService],
})
export class AdminModule {}
