import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Comment } from 'src/comment/entities/comment.entity';
import { AdminCommentQueryDto } from '../dto/admin.comment-query.dto';
import { getExclusiveUpperDate } from '../utils/date-range.util';

@Injectable()
export class AdminCommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
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

  async deleteComment(commentId: number) {
    const comment = await this.commentRepository.delete(commentId);
    if (comment.affected === 0) {
      throw new NotFoundException('Comment not found');
    }
    return { message: 'Comment deleted' };
  }
}
