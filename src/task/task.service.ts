import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Task) private taskRepository: Repository<Task>,
  ) {}

  async createTask(dto: CreateTaskDto, createdById: number, projectId: number) {
    const assignee = this.userRepository.findOne({
      where: { id: dto.assignee },
    });

    if (!assignee) {
      throw new NotFoundException('Resource not found');
    }

    return await this.taskRepository.save({
      title: dto.title,
      description: dto.description,
      status: dto.status,
      dueDate: dto.dueDate,
      createdBy: { id: createdById },
      project: { id: projectId },
      assignee: { id: dto.assignee },
    });
  }

  async findAllTask(projectId: number) {
    const tasks = await this.taskRepository.find({
      where: { project: { id: projectId } },
    });

    if (tasks.length === 0) {
      throw new NotFoundException('Task not found');
    }
    return tasks;
  }

  async findOneTask(projectId: number, taskId: number) {
    const task = await this.taskRepository.findOne({
      where: { id: taskId, project: { id: projectId } },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    return `This action updates a #${id} task`;
  }

  remove(id: number) {
    return `This action removes a #${id} task`;
  }
}
