import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  AdminDeleteTaskDocs,
  AdminFindAllTaskDocs,
  AdminFindOneTaskDocs,
} from 'src/common/decorators/swagger/admin-task-docs.decorator';
import { AdminTaskQueryDto } from '../dto/admin.task-query.dto';
import { AdminTaskService } from '../services/admin-task.service';
import { ParseIdPipe } from 'src/common/pipes/parse-id.pipe';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminTaskController {
  constructor(private readonly adminService: AdminTaskService) {}

  @AdminFindAllTaskDocs()
  @Roles('admin')
  @Get('tasks')
  async findAllTask(@Query() query: AdminTaskQueryDto) {
    return this.adminService.findAllTask(query);
  }

  @AdminFindOneTaskDocs()
  @Roles('admin')
  @Get('tasks/:taskId')
  async findOneTask(@Param('taskId', ParseIdPipe) taskId: number) {
    return this.adminService.findOneTask(taskId);
  }

  @AdminDeleteTaskDocs()
  @Roles('admin')
  @Delete('tasks/:taskId')
  async deleteTask(
    @Param('taskId', ParseIdPipe) taskId: number,
    @Request() req,
  ) {
    return this.adminService.deleteTask(taskId, req.user.id, req.requestId);
  }
}
