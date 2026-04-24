import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/comment/entities/comment.entity';
import { Project } from 'src/project/entities/project.entity';
import { Task } from 'src/task/entities/task.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Project) private projectRepository: Repository<Project>,
    @InjectRepository(Task) private taskRepository: Repository<Task>,
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
  ) {}

  async findAllUser() {
    const users = await this.userRepository.find();
    if (!users) {
      throw new NotFoundException('User not found');
    }
    return users;
  }

  async findOneUser(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async setUserRole(userId: number, dto: UpdateUserRoleDto) {
    const user = await this.userRepository.update(userId, { role: dto.role });
    if (user.affected === 0) {
      throw new NotFoundException('User not found');
    }
    return await this.userRepository.findOne({ where: { id: userId } });
  }

  async deleteUser(userId: number) {
    const user = await this.userRepository.delete(userId);
    if (user.affected === 0) {
      throw new NotFoundException('User not found');
    }
    return { message: 'user deleted' };
  }

  async findAllProject() {
    const projects = await this.projectRepository.find();
    if (!projects) {
      throw new NotFoundException('Project not found');
    }
    return projects;
  }

  async findOneProject(projectId: number) {
    const projects = await this.projectRepository.findOne({
      where: { id: projectId },
    });
    if (!projects) {
      throw new NotFoundException('Project not found');
    }
    return projects;
  }

  async deleteProject(projectId: number) {
    const project = await this.projectRepository.delete(projectId);
    if (project.affected === 0) {
      throw new NotFoundException('Project not found');
    }
    return { message: 'Project deleted' };
  }

  async findAllTask() {
    const tasks = await this.taskRepository.find();
    if (!tasks) {
      throw new NotFoundException('Task not found');
    }
    return tasks;
  }

  async findOneTask(taskId: number) {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async deleteTask(taskId: number) {
    const task = await this.taskRepository.delete(taskId);
    if (task.affected === 0) {
      throw new NotFoundException('Task not found');
    }
    return { message: 'Task deleted' };
  }

  async findAllComment() {
    const comments = await this.commentRepository.find();
    if (!comments) {
      throw new NotFoundException('Comment not found');
    }
    return comments;
  }

  async deleteComment(commentId: number) {
    const comment = await this.commentRepository.delete(commentId);
    if (comment.affected === 0) {
      throw new NotFoundException('Comment not found');
    }
    return { message: 'Comment deleted' };
  }
}
