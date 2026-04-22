import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { TaskStatusEnum } from '../enums/task-status.enum';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string;

  @IsEnum(TaskStatusEnum)
  @IsOptional()
  status: TaskStatusEnum;

  @IsDate()
  @IsOptional()
  dueDate: Date;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  assignee: number;
}
