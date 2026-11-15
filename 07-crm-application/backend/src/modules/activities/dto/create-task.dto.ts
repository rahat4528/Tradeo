import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Priority } from '@prisma/client';

export class CreateTaskDto {
  @ApiProperty({ example: 'Send revised contract with SLA addendum' })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiProperty({ example: '2026-11-30', required: false })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiProperty({ enum: Priority, example: Priority.HIGH, required: false })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiProperty({ example: 'deal-uuid', required: false })
  @IsOptional()
  @IsString()
  dealId?: string;
}
