import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    const assignee = await this.userRepository.findOne({
      where: { id: dto.assignee },
    });

    if (!assignee) {
      throw new NotFoundException('Resource not found');
    }

    const savedTask = await this.taskRepository.save({
      title: dto.title,
      description: dto.description,
      status: dto.status,
      dueDate: dto.dueDate,
      createdBy: { id: createdById },
      project: { id: projectId },
      assignee: { id: dto.assignee },
    });
    return await this.taskRepository.findOne({
      where: { id: savedTask.id },
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

  async updateTask(taskId: number, dto: UpdateTaskDto) {
    const updateData: Partial<
      Pick<Task, 'title' | 'description' | 'status' | 'dueDate' | 'assignee'>
    > = {};
    if ('title' in dto) {
      updateData.title = dto.title;
    }
    if ('description' in dto) {
      updateData.description = dto.description;
    }
    if ('status' in dto) {
      updateData.status = dto.status;
    }
    if ('dueDate' in dto) {
      updateData.dueDate = dto.dueDate;
    }
    if (dto.assignee !== undefined) {
      if (dto.assignee === null) {
        updateData.assignee = null;
      } else {
        const user = await this.userRepository.findOneBy({ id: dto.assignee });

        if (!user) {
          throw new NotFoundException('Assignee not found');
        }

        updateData.assignee = user;
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException(
        'At least one of the fields must be provided.',
      );
    }

    const task = await this.taskRepository.update({ id: taskId }, updateData);

    if (task.affected === 0) {
      throw new NotFoundException('Project not found');
    }

    return await this.taskRepository.findOne({
      where: { id: taskId },
    });
  }
}
