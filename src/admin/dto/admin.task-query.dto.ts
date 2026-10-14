import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { TaskStatusEnum } from 'src/task/enums/task-status.enum';
import { SortOrder } from './admin.user-query.dto';

export function ToBoolean() {
  return Transform(({ value }) => {
    if (value === true || value === 'true') {
      return true;
    }

    if (value === false || value === 'false') {
      return false;
    }

    return value;
  });
}

export enum AdminTaskSortField {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  DUE_DATE = 'dueDate',
  TITLE = 'title',
}

export class AdminTaskQueryDto {
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
  @Type(() => Number)
  @IsInt()
  @Min(1)
  projectId?: number;

  @IsOptional()
  @IsEnum(TaskStatusEnum)
  status?: TaskStatusEnum;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  assigneeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  createdById?: number;

  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  hasAssignee?: boolean;

  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  overdue?: boolean;

  @IsOptional()
  @IsDateString()
  dueFrom?: string;

  @IsOptional()
  @IsDateString()
  dueTo?: string;

  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @IsOptional()
  @IsDateString()
  createdTo?: string;

  @IsOptional()
  @IsEnum(AdminTaskSortField)
  sortBy = AdminTaskSortField.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder = SortOrder.DESC;
}
