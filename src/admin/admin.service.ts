import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/comment/entities/comment.entity';
import { Project } from 'src/project/entities/project.entity';
import { Task } from 'src/task/entities/task.entity';
import { User } from 'src/user/entities/user.entity';
import { FindOptionsWhere, ILike, Repository, Brackets } from 'typeorm';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { AdminUserQueryDto } from './dto/admin.user-query.dto';
import { AdminProjectQueryDto } from './dto/admin.project-query.dto';
import { AdminTaskQueryDto } from './dto/admin.task-query.dto';
import { TaskStatusEnum } from 'src/task/enums/task-status.enum';
import { AdminCommentQueryDto } from './dto/admin.comment-query.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Project) private projectRepository: Repository<Project>,
    @InjectRepository(Task) private taskRepository: Repository<Task>,
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
  ) {}

  private getExclusiveUpperDate(value: string): Date {
    const date = new Date(value);

    if (!value.includes('T')) {
      date.setUTCDate(date.getUTCDate() + 1);
    }

    return date;
  }

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
      const createdToExclusive = this.getExclusiveUpperDate(createdTo);

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

  async findAllTask(query: AdminTaskQueryDto = new AdminTaskQueryDto()) {
    const normalizedQuery = Object.assign(new AdminTaskQueryDto(), query);
    const {
      page,
      limit,
      projectId,
      status,
      assigneeId,
      createdById,
      hasAssignee,
      overdue,
      q,
      createdFrom,
      createdTo,
      dueFrom,
      dueTo,
      sortBy,
      sortOrder,
    } = normalizedQuery;
    const term = q?.trim();

    const qb = this.taskRepository
      .createQueryBuilder('task')
      .leftJoin('task.project', 'project')
      .leftJoin('task.assignee', 'assignee')
      .leftJoin('task.createdBy', 'createdBy')
      .addSelect([
        'project.id',
        'project.name',
        'assignee.id',
        'assignee.name',
        'assignee.email',
        'createdBy.id',
        'createdBy.name',
      ]);

    if (term) {
      qb.andWhere(
        new Brackets((searchQb) => {
          searchQb
            .where('task.title ILIKE :term', {
              term: `%${term}%`,
            })
            .orWhere('task.description ILIKE :term', {
              term: `%${term}%`,
            });
        }),
      );
    }

    if (projectId !== undefined) {
      qb.andWhere('task.projectId = :projectId', { projectId });
    }

    if (status !== undefined) {
      qb.andWhere('task.status = :status', { status });
    }

    if (assigneeId !== undefined) {
      qb.andWhere('task.assigneeId = :assigneeId', { assigneeId });
    }

    if (createdById !== undefined) {
      qb.andWhere('task.createdById = :createdById', { createdById });
    }

    if (hasAssignee === true) {
      qb.andWhere('task.assigneeId IS NOT NULL');
    }

    if (hasAssignee === false) {
      qb.andWhere('task.assigneeId IS NULL');
    }

    if (overdue === true) {
      qb.andWhere('task.dueDate < CURRENT_TIMESTAMP');
      qb.andWhere('task.status != :completedStatus', {
        completedStatus: TaskStatusEnum.DONE,
      });
    }

    if (overdue === false) {
      qb.andWhere(
        new Brackets((notOverdueQb) => {
          notOverdueQb
            .where('task.dueDate IS NULL')
            .orWhere('task.dueDate >= CURRENT_TIMESTAMP')
            .orWhere('task.status = :doneStatus', {
              doneStatus: TaskStatusEnum.DONE,
            });
        }),
      );
    }

    if (dueFrom) {
      qb.andWhere('task.dueDate >= :dueFrom', {
        dueFrom: new Date(dueFrom),
      });
    }

    if (dueTo) {
      const dueToExclusive = this.getExclusiveUpperDate(dueTo);

      qb.andWhere('task.dueDate < :dueTo', {
        dueTo: dueToExclusive,
      });
    }

    if (createdFrom) {
      qb.andWhere('task.createdAt >= :createdFrom', {
        createdFrom: new Date(createdFrom),
      });
    }

    if (createdTo) {
      const createdToExclusive = this.getExclusiveUpperDate(createdTo);

      qb.andWhere('task.createdAt < :createdTo', {
        createdTo: createdToExclusive,
      });
    }

    const direction = sortOrder.toUpperCase() as 'ASC' | 'DESC';

    qb.orderBy(`task.${sortBy}`, direction)
      .addOrderBy('task.id', direction)
      .skip((page - 1) * limit)
      .take(limit);

    const [tasks, total] = await qb.getManyAndCount();

    const data = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      dueDate: task.dueDate,

      project: {
        id: task.project.id,
        name: task.project.name,
      },

      assignee: task.assignee
        ? {
            id: task.assignee?.id,
            name: task.assignee?.name,
            email: task.assignee?.email,
          }
        : null,

      createdBy: task.createdBy
        ? {
            id: task.createdBy.id,
            name: task.createdBy.name,
          }
        : null,
    }));

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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

  async findAllComment(
    query: AdminCommentQueryDto = new AdminCommentQueryDto(),
  ) {
    const normalizedQuery = Object.assign(new AdminCommentQueryDto(), query);

    const {
      page,
      limit,
      q,
      projectId,
      taskId,
      authorId,
      createdFrom,
      createdTo,
      sortBy,
      sortOrder,
    } = normalizedQuery;

    const term = q?.trim();

    const qb = this.commentRepository
      .createQueryBuilder('comment')
      .innerJoin('comment.task', 'task')
      .innerJoin('task.project', 'project')
      .leftJoin('comment.author', 'author')
      .addSelect([
        'task.id',
        'task.title',
        'project.id',
        'project.name',
        'author.id',
        'author.name',
        'author.email',
      ]);

    if (term) {
      qb.andWhere(
        new Brackets((searchQb) => {
          searchQb.where('comment.content ILIKE :term', {
            term: `%${term}%`,
          });
        }),
      );
    }

    if (projectId !== undefined) {
      qb.andWhere('task.projectId = :projectId', { projectId });
    }

    if (taskId !== undefined) {
      qb.andWhere('comment.taskId = :taskId', { taskId });
    }

    if (authorId !== undefined) {
      qb.andWhere('comment.authorId = :authorId', { authorId });
    }

    if (createdFrom) {
      qb.andWhere('comment.createdAt >= :createdFrom', {
        createdFrom: new Date(createdFrom),
      });
    }

    if (createdTo) {
      const createdToExclusive = this.getExclusiveUpperDate(createdTo);

      qb.andWhere('comment.createdAt < :createdTo', {
        createdTo: createdToExclusive,
      });
    }

    const direction = sortOrder.toUpperCase() as 'ASC' | 'DESC';

    qb.orderBy(`comment.${sortBy}`, direction)
      .addOrderBy('comment.id', direction)
      .skip((page - 1) * limit)
      .take(limit);

    const [comments, total] = await qb.getManyAndCount();

    const data = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,

      author: {
        id: comment.author.id,
        name: comment.author.name,
        email: comment.author.email,
      },

      task: {
        id: comment.task.id,
        title: comment.task.title,
      },

      project: {
        id: comment.task.project.id,
        name: comment.task.project.name,
      },
    }));

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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
