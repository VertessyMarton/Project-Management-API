import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from 'src/task/entities/task.entity';
import { Brackets, Repository } from 'typeorm';
import { AdminTaskQueryDto } from '../dto/admin.task-query.dto';
import { getExclusiveUpperDate } from '../utils/date-range.util';
import { TaskStatusEnum } from 'src/task/enums/task-status.enum';

@Injectable()
export class AdminTaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

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
      const dueToExclusive = getExclusiveUpperDate(dueTo);

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
      const createdToExclusive = getExclusiveUpperDate(createdTo);

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
      description: task.description,
      status: task.status,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,

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
}
