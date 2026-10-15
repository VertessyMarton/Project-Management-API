import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ example: 'Prepare release notes' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  title: string;

  @ApiProperty({
    example: 'Summarize completed project work',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string;

  @ApiProperty({
    example: TaskStatusEnum.TODO,
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
  @IsDate()
  @IsOptional()
  dueDate: Date;

  @ApiProperty({ example: 2, required: false })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  assignee: number;
}
