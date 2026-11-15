import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsInt,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Priority, TaskStatus, RecurrenceRule } from '@prisma/client';

export class CreateSubtaskDto {
  @ApiProperty({ example: 'Review API contracts' })
  @IsNotEmpty()
  @IsString()
  title!: string;
}

export class CreateTaskDto {
  @ApiProperty({ example: 'Implement Redis task queue notification dispatcher' })
  @IsNotEmpty({ message: 'Task title is required.' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Configure BullMQ and background workers', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: Priority, default: Priority.MEDIUM, required: false })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiProperty({ enum: TaskStatus, default: TaskStatus.TODO, required: false })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({ example: 'uuid-category-id', required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ example: '2026-11-20T18:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ enum: RecurrenceRule, default: RecurrenceRule.NONE, required: false })
  @IsOptional()
  @IsEnum(RecurrenceRule)
  recurrence?: RecurrenceRule;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  recurrenceInterval?: number;

  @ApiProperty({ example: 45, required: false })
  @IsOptional()
  @IsInt()
  estimatedMinutes?: number;

  @ApiProperty({ example: 'redis,backend,critical', required: false })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiProperty({ type: [CreateSubtaskDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubtaskDto)
  subtasks?: CreateSubtaskDto[];
}
