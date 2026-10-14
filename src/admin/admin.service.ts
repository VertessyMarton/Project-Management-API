import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/comment/entities/comment.entity';
import { Project } from 'src/project/entities/project.entity';
import { Task } from 'src/task/entities/task.entity';
import { User } from 'src/user/entities/user.entity';
import {
  FindOptionsWhere,
  ILike,
  Repository,
  QueryBuilder,
  Brackets,
} from 'typeorm';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { AdminUserQueryDto } from './dto/admin.user-query.dto';
import { AdminProjectQueryDto } from './dto/admin.project-query.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Project) private projectRepository: Repository<Project>,
    @InjectRepository(Task) private taskRepository: Repository<Task>,
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
  ) {}

  async findAllUser(query: AdminUserQueryDto = new AdminUserQueryDto()) {
    const normalizedQuery = Object.assign(new AdminUserQueryDto(), query);
    const { page, limit, role, status, q, sortBy, sortOrder } = normalizedQuery;
    const term = q?.trim();

    const baseWhere: FindOptionsWhere<User> = {};

    if (role !== undefined) {
      baseWhere.role = role;
    }
    if (status !== undefined) {
      baseWhere.status = status;
    }

    const where: FindOptionsWhere<User>[] | FindOptionsWhere<User> = term
      ? [
          { ...baseWhere, name: ILike(`%${term}%`) },
          { ...baseWhere, email: ILike(`%${term}%`) },
        ]
      : baseWhere;

    const [users, total] = await this.userRepository.findAndCount({
      where,
      order: {
        [sortBy]: sortOrder,
        id: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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

  async findAllProject(
    query: AdminProjectQueryDto = new AdminProjectQueryDto(),
  ) {
    const normalizedQuery = Object.assign(new AdminProjectQueryDto(), query);

    const {
      page,
      limit,
      q,
      memberId,
      createdFrom,
      createdTo,
      sortBy,
      sortOrder,
    } = normalizedQuery;

    const qb = this.projectRepository.createQueryBuilder('project');

    const term = q?.trim();

    if (term) {
      qb.andWhere(
        new Brackets((searchQb) => {
          searchQb
            .where('project.name ILIKE :term', {
              term: `%${term}%`,
            })
            .orWhere('project.description ILIKE :term', {
              term: `%${term}%`,
            });
        }),
      );
    }

    if (memberId !== undefined) {
      qb.innerJoin(
        'project.projectMembers',
        'member',
        'member.userId = :memberId',
        { memberId },
      );
    }

    if (createdFrom) {
      qb.andWhere('project.createdAt >= :createdFrom', {
        createdFrom: new Date(createdFrom),
      });
    }

    if (createdTo) {
      const createdToExclusive = new Date(createdTo);

      if (!createdTo.includes('T')) {
        createdToExclusive.setUTCDate(createdToExclusive.getUTCDate() + 1);
      }

      qb.andWhere('project.createdAt < :createdTo', {
        createdTo: createdToExclusive,
      });
    }

    const direction = sortOrder.toUpperCase() as 'ASC' | 'DESC';

    qb.orderBy(`project.${sortBy}`, direction)
      .addOrderBy('project.id', direction)
      .skip((page - 1) * limit)
      .take(limit);

    const [projects, total] = await qb.getManyAndCount();

    return {
      data: projects,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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

  async getStats() {
    const [users, projects, tasks, comments] = await Promise.all([
      this.userRepository.count(),
      this.projectRepository.count(),
      this.taskRepository.count(),
      this.commentRepository.count(),
    ]);

    return {
      users,
      projects,
      tasks,
      comments,
    };
  }
}
