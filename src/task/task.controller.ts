import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ProjectRolesGuard } from 'src/common/guards/project-roles.guard';
import { ProjectRoles } from 'src/common/decorators/project-roles.decorator';

@UseGuards(JwtAuthGuard, ProjectRolesGuard)
@Controller('projects')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @ProjectRoles(['owner', 'member'])
  @Post(':projectId/tasks')
  async createTask(
    @Request() req,
    @Param('projectId') id: number,
    @Body() dto: CreateTaskDto,
  ) {
    return await this.taskService.createTask(dto, req.user.id, id);
  }

  @ProjectRoles(['owner', 'member', 'viewer'])
  @Get(':projectId/tasks')
  findAllTask(@Param('projectId') id: number) {
    return this.taskService.findAllTask(id);
  }

  @ProjectRoles(['owner', 'member', 'viewer'])
  @Get(':projectId/tasks/:taskId')
  findOneTask(
    @Param('projectId') projectId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
  ) {
    return this.taskService.findOneTask(projectId, taskId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(+id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taskService.remove(+id);
  }
}
