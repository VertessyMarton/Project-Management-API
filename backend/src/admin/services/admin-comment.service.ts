import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
import { Comment } from 'src/comment/entities/comment.entity';
import { AdminCommentQueryDto } from '../dto/admin.comment-query.dto';
import { getExclusiveUpperDate } from '../utils/date-range.util';
import { AdminUserService } from './admin-user.service';
import { AuditLog } from 'src/audit-log/entities/aduit-log.entity';
import { AuditLogService } from 'src/audit-log/audit-log.service';
import { AuditCategory } from 'src/audit-log/enums/log-category.enum';
import { AuditTargetType } from 'src/audit-log/enums/log-target-type.enum';
import { AuditOutcome } from 'src/audit-log/enums/log-outcome.enum';
import { UUID } from 'crypto';

@Injectable()
export class AdminCommentService {
  private readonly logger = new Logger(AdminUserService.name);
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
    private auditService: AuditLogService,
    private dataSource: DataSource,
  ) {}

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
      const createdToExclusive = getExclusiveUpperDate(createdTo);

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

  async deleteComment(userId: number, actorId: number, requestId: UUID) {
    return this.auditService.run(
      {
        category: AuditCategory.ADMIN,
        action: 'admin.comment.delete',
        actorId,
        targetType: AuditTargetType.COMMENT,
        targetId: userId,
        requestId,
      },
      async (manager, audit) => {
        const comments = manager.getRepository(Comment);
        const comment = await comments.findOne({
          where: { id: userId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!comment) {
          throw new NotFoundException('Comment not found');
        }

        audit.setMetadata({ name: comment.content, taskId: comment.taskId });
        await comments.delete(userId);
        return { message: 'comment deleted' };
      },
    );
  }
}
