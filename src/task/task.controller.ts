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
import {
  CreateTaskDocs,
  FindAllTaskDocs,
  FindOneTaskDocs,
  RemoveTaskDocs,
  UpdateTaskDocs,
} from 'src/common/decorators/swagger/task-docs.decorator';
import {
  MutationLimit,
  ReadLimit,
} from 'src/common/decorators/rate-limit.decorator';

@UseGuards(JwtAuthGuard, ProjectRolesGuard)
@Controller('projects')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @CreateTaskDocs()
  @ProjectRoles(['owner', 'member'])
  @MutationLimit()
  @Post(':projectId/tasks')
  async createTask(
    @Request() req,
    @Param('projectId') id: number,
    @Body() dto: CreateTaskDto,
  ) {
    return await this.taskService.createTask(dto, req.user.id, id);
  }

  @FindAllTaskDocs()
  @ProjectRoles(['owner', 'member', 'viewer'])
  @ReadLimit()
  @Get(':projectId/tasks')
  findAllTask(@Param('projectId') id: number) {
    return this.taskService.findAllTask(id);
  }

  @FindOneTaskDocs()
  @ProjectRoles(['owner', 'member', 'viewer'])
  @ReadLimit()
  @Get(':projectId/tasks/:taskId')
  findOneTask(
    @Param('projectId') projectId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
  ) {
    return this.taskService.findOneTask(projectId, taskId);
  }

  @UpdateTaskDocs()
  @ProjectRoles(['owner', 'member'])
  @MutationLimit()
  @Patch(':projectId/tasks/:taskId')
  updateTask(@Param('taskId') id: number, @Body() dto: UpdateTaskDto) {
    return this.taskService.updateTask(id, dto);
  }

  @RemoveTaskDocs()
  @ProjectRoles(['owner', 'member'])
  @MutationLimit()
  @Delete(':projectId/tasks/:taskId')
  removeTask(@Param('taskId') id: number) {
    return this.taskService.removeTask(id);
  }
}
