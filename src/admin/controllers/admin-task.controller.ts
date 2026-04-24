import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from '../admin.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminTaskController {
  constructor(private readonly adminService: AdminService) {}

  @Roles('admin')
  @Get('tasks')
  async findAllTask() {
    return this.adminService.findAllTask();
  }

  @Roles('admin')
  @Get('tasks/:taskId')
  async findOneTask(@Param('taskId', ParseIntPipe) taskId: number) {
    return this.adminService.findOneTask(taskId);
  }

  @Roles('admin')
  @Delete('tasks/:taskId')
  async deleteTask(@Param('taskId', ParseIntPipe) taskId: number) {
    return this.adminService.deleteTask(taskId);
  }
}
