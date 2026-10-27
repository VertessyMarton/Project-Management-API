import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditCategory } from '../enums/log-category.enum';
import { AuditTargetType } from '../enums/log-target-type.enum';
import { AuditOutcome } from '../enums/log-outcome.enum';
import { UUID } from 'crypto';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: string;

  @CreateDateColumn({ name: 'occured_at' })
  occuredAt: Date;

  @Column({ type: 'varchar', enum: AuditCategory })
  category: AuditCategory;

  @Column()
  action: string;

  @Column({ name: 'actorId', type: 'integer', nullable: true })
  actorId: number | null;

  @Column({ enum: AuditTargetType, type: 'varchar', nullable: true })
  targetType: AuditTargetType | null;

  @Column({ name: 'target_id', type: 'integer', nullable: true })
  targetId: number | null;

  @Column({ type: 'varchar', enum: AuditOutcome })
  outcome: AuditOutcome;

  @Column({ type: 'jsonb' })
  metadata: Record<string, unknown> | null;

  @Column({
    name: 'request_id',
    type: 'varchar',
    nullable: true,
  })
  requestId: UUID | null;
}
