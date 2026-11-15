import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Priority, TaskStatus, RecurrenceRule } from '@prisma/client';

export class UpdateTaskDto {
  @ApiProperty({ example: 'Updated title', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: Priority, required: false })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiProperty({ enum: TaskStatus, required: false })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({ example: 'uuid-category-id', required: false })
  @IsOptional()
  @IsString()
  categoryId?: string | null;

  @ApiProperty({ example: '2026-11-25T18:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string | null;

  @ApiProperty({ enum: RecurrenceRule, required: false })
  @IsOptional()
  @IsEnum(RecurrenceRule)
  recurrence?: RecurrenceRule;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  recurrenceInterval?: number;

  @ApiProperty({ example: 60, required: false })
  @IsOptional()
  @IsInt()
  estimatedMinutes?: number | null;

  @ApiProperty({ example: 'backend,done', required: false })
  @IsOptional()
  @IsString()
  tags?: string | null;
}
