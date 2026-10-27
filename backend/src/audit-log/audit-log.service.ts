import { Injectable, Logger } from '@nestjs/common';
import { Brackets, DataSource, EntityManager, Repository } from 'typeorm';
import { AuditLog } from './entities/aduit-log.entity';
import { AuditOutcome } from './enums/log-outcome.enum';
import { UUID } from 'crypto';
import { getExclusiveUpperDate } from 'src/admin/utils/date-range.util';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { InjectRepository } from '@nestjs/typeorm';

export type AuditEvent = Pick<
  AuditLog,
  'category' | 'action' | 'actorId' | 'targetType' | 'targetId'
> & {
  requestId?: UUID;
  metadata?: Record<string, unknown>;
};

export interface AuditContext {
  setMetadata(metadata: Record<string, unknown>): void;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
    private readonly dataSource: DataSource,
  ) {}

  async record(
    event: AuditEvent & { outcome: AuditOutcome },
    manager: EntityManager = this.dataSource.manager,
  ) {
    return manager.getRepository(AuditLog).save({
      ...event,
      metadata: event.metadata ?? {},
    });
  }

  async run<T>(
    event: AuditEvent,
    operation: (manager: EntityManager, audit: AuditContext) => Promise<T>,
  ): Promise<T> {
    let metadata = { ...event.metadata };
    const audit: AuditContext = {
      setMetadata(value) {
        metadata = { ...value };
      },
    };

    try {
      return await this.dataSource.transaction(async (manager) => {
        const result = await operation(manager, audit);
        await this.record(
          { ...event, metadata, outcome: AuditOutcome.SUCCESS },
          manager,
        );
        return result;
      });
    } catch (error) {
      try {
        await this.record({
          ...event,
          metadata,
          outcome: AuditOutcome.FAILURE,
        });
      } catch (auditError) {
        this.logger.error('Failed to record audit failure', auditError);
      }
      throw error;
    }
  }

  async findAllAuditLogs(query: AuditLogQueryDto = new AuditLogQueryDto()) {
    const normalizedQuery = Object.assign(new AuditLogQueryDto(), query);
    const {
      page,
      limit,
      q,
      category,
      targetType,
      outcome,
      actorId,
      targetId,
      requestId,
      occuredFrom,
      occuredTo,
      sortBy,
      sortOrder,
    } = normalizedQuery;
    const term = q?.trim();

    const qb = this.auditRepository.createQueryBuilder('auditLog');

    if (term) {
      qb.andWhere(
        new Brackets((searchQb) => {
          searchQb
            .where('"auditLog"."action" ILIKE :term')
            .orWhere('CAST("auditLog"."metadata" AS text) ILIKE :term');
        }),
        { term: `%${term}%` },
      );
    }

    if (actorId !== undefined) {
      qb.andWhere('auditLog.actorId = :actorId', { actorId });
    }

    if (targetId !== undefined) {
      qb.andWhere('auditLog.targetId = :targetId', { targetId });
    }

    if (requestId !== undefined) {
      qb.andWhere('auditLog.requestId = :requestId', { requestId });
    }

    if (category !== undefined) {
      qb.andWhere('auditLog.category = :category', { category });
    }

    if (targetType !== undefined) {
      qb.andWhere('auditLog.targetType = :targetType', { targetType });
    }

    if (outcome !== undefined) {
      qb.andWhere('auditLog.outcome = :outcome', { outcome });
    }

    if (occuredFrom) {
      qb.andWhere('auditLog.occuredAt >= :occuredFrom', {
        occuredFrom: new Date(occuredFrom),
      });
    }

    if (occuredTo) {
      const createdToExclusive = getExclusiveUpperDate(occuredTo);

      qb.andWhere('auditLog.occuredAt < :occuredTo', {
        occuredTo: createdToExclusive,
      });
    }

    const direction = sortOrder.toUpperCase() as 'ASC' | 'DESC';

    qb.orderBy(`auditLog.${sortBy}`, direction)
      .addOrderBy('auditLog.id', direction)
      .skip((page - 1) * limit)
      .take(limit);

    const [auditLogs, total] = await qb.getManyAndCount();

    return {
      data: auditLogs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
