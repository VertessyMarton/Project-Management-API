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
  Query,
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
import { TaskQueryDto } from './dto/task-query.dto';

@UseGuards(JwtAuthGuard, ProjectRolesGuard)
@Controller('projects')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @CreateTaskDocs()
  @ProjectRoles(['owner', 'admin', 'member'])
  @MutationLimit()
  @Post(':projectId/tasks')
  async createTask(
    @Request() req,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: CreateTaskDto,
  ) {
    return await this.taskService.createTask(dto, req.user.id, projectId);
  }

  @FindAllTaskDocs()
  @ProjectRoles(['owner', 'member', 'viewer'])
  @ReadLimit()
  @Get(':projectId/tasks')
  findAllTask(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query() query: TaskQueryDto,
  ) {
    return this.taskService.findAllTasks(projectId, query);
  }

  @FindOneTaskDocs()
  @ProjectRoles(['owner', 'admin', 'member', 'viewer'])
  @ReadLimit()
  @Get(':projectId/tasks/:taskId')
  findOneTask(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
  ) {
    return this.taskService.findOneTask(projectId, taskId);
  }

  @UpdateTaskDocs()
  @ProjectRoles(['owner', 'admin', 'member'])
  @MutationLimit()
  @Patch(':projectId/tasks/:taskId')
  updateTask(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.taskService.updateTask(taskId, projectId, dto);
  }

  @RemoveTaskDocs()
  @ProjectRoles(['owner', 'admin', 'member'])
  @MutationLimit()
  @Delete(':projectId/tasks/:taskId')
  removeTask(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
  ) {
    return this.taskService.removeTask(taskId, projectId);
  }
}
