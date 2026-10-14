import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from '../admin.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  AdminDeleteTaskDocs,
  AdminFindAllTaskDocs,
  AdminFindOneTaskDocs,
} from 'src/common/decorators/swagger/admin-task-docs.decorator';
import { AdminTaskQueryDto } from '../dto/admin.task-query.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminTaskController {
  constructor(private readonly adminService: AdminService) {}

  @AdminFindAllTaskDocs()
  @Roles('admin')
  @Get('tasks')
  async findAllTask(@Query() query: AdminTaskQueryDto) {
    return this.adminService.findAllTask(query);
  }

  @AdminFindOneTaskDocs()
  @Roles('admin')
  @Get('tasks/:taskId')
  async findOneTask(@Param('taskId', ParseIntPipe) taskId: number) {
    return this.adminService.findOneTask(taskId);
  }

  @AdminDeleteTaskDocs()
  @Roles('admin')
  @Delete('tasks/:taskId')
  async deleteTask(@Param('taskId', ParseIntPipe) taskId: number) {
    return this.adminService.deleteTask(taskId);
  }
}
