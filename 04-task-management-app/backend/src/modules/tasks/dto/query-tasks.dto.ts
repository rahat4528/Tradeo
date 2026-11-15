import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Priority, TaskStatus } from '@prisma/client';

export class QueryTasksDto {
  @ApiProperty({ enum: TaskStatus, required: false })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({ enum: Priority, required: false })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiProperty({ example: 'uuid', required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ example: 'today', enum: ['today', 'upcoming', 'overdue', 'completed', 'all'], required: false })
  @IsOptional()
  @IsString()
  filter?: string;

  @ApiProperty({ example: 'redis', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ example: 'backend', required: false })
  @IsOptional()
  @IsString()
  tag?: string;
}
