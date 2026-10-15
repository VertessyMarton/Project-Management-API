import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { TaskStatusEnum } from '../enums/task-status.enum';

export class UpdateTaskDto {
  @ApiProperty({ example: 'Prepare release notes', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    example: 'Summarize completed project work',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: TaskStatusEnum.IN_PROGRESS,
    enum: TaskStatusEnum,
    required: false,
  })
  @IsEnum(TaskStatusEnum)
  @IsOptional()
  status: TaskStatusEnum;

  @ApiProperty({
    example: '2026-05-01T10:30:00.000Z',
    required: false,
  })
  @IsOptional()
  dueDate?: Date;

  @ApiProperty({ example: 2, required: false, nullable: true })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  assignee?: number | null;
}
