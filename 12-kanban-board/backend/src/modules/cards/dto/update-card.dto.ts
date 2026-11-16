import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Priority } from '@prisma/client';

export class UpdateCardDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  columnId?: string;

  @IsString()
  @IsOptional()
  swimlaneId?: string | null;

  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @IsString()
  @IsOptional()
  size?: string;

  @IsNumber()
  @IsOptional()
  position?: number;

  @IsString()
  @IsOptional()
  assigneeId?: string | null;
}
