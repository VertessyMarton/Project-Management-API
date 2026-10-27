import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { SortOrder } from 'src/project/dto/project-query.dto';
import { AuditCategory } from '../enums/log-category.enum';
import { AuditTargetType } from '../enums/log-target-type.enum';
import { AuditOutcome } from '../enums/log-outcome.enum';

export enum AuditLogSortField {
  OCCURED_AT = 'occuredAt',
  ACTION = 'action',
}

export class AuditLogQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 25;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @IsEnum(AuditCategory)
  category?: AuditCategory;

  @IsOptional()
  @IsEnum(AuditTargetType)
  targetType?: AuditTargetType;

  @IsOptional()
  @IsEnum(AuditOutcome)
  outcome?: AuditOutcome;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  actorId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  targetId?: number;

  @IsOptional()
  @Type(() => String)
  @IsString()
  requestId?: number;

  @IsOptional()
  @IsDateString()
  occuredFrom?: string;

  @IsOptional()
  @IsDateString()
  occuredTo?: string;

  @IsOptional()
  @IsEnum(AuditLogSortField)
  sortBy = AuditLogSortField.OCCURED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder = SortOrder.DESC;
}
