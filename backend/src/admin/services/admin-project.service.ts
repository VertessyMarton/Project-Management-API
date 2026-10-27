import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
import { Project } from 'src/project/entities/project.entity';
import { AdminProjectQueryDto } from '../dto/admin.project-query.dto';
import { getExclusiveUpperDate } from '../utils/date-range.util';
import { AuditLogService } from 'src/audit-log/audit-log.service';
import { AuditLog } from 'src/audit-log/entities/aduit-log.entity';
import { AdminUserService } from './admin-user.service';
import { AuditCategory } from 'src/audit-log/enums/log-category.enum';
import { AuditTargetType } from 'src/audit-log/enums/log-target-type.enum';
import { AuditOutcome } from 'src/audit-log/enums/log-outcome.enum';
import { UUID } from 'crypto';

@Injectable()
export class AdminProjectService {
  private readonly logger = new Logger(AdminUserService.name);
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
    private auditService: AuditLogService,
    private dataSource: DataSource,
  ) {}

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
      qb.innerJoin('project.projectMembers', 'member').andWhere(
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
      const createdToExclusive = getExclusiveUpperDate(createdTo);

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

  async deleteProject(userId: number, actorId: number, requestId: UUID) {
    return this.auditService.run(
      {
        category: AuditCategory.ADMIN,
        action: 'admin.project.delete',
        actorId,
        targetType: AuditTargetType.PROJECT,
        targetId: userId,
        requestId,
      },
      async (manager, audit) => {
        const projects = manager.getRepository(Project);
        const project = await projects.findOne({
          where: { id: userId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!project) {
          throw new NotFoundException('Project not found');
        }

        audit.setMetadata({ name: project.name });
        await projects.delete(userId);
        return { message: 'project deleted' };
      },
    );
  }
}
