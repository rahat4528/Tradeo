import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { IssuePriority, IssueType } from '@prisma/client';

export class UpdateIssueDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(IssueType)
  @IsOptional()
  type?: IssueType;

  @IsEnum(IssuePriority)
  @IsOptional()
  priority?: IssuePriority;

  @IsString()
  @IsOptional()
  statusId?: string;

  @IsString()
  @IsOptional()
  sprintId?: string | null;

  @IsString()
  @IsOptional()
  parentId?: string | null;

  @IsString()
  @IsOptional()
  assigneeId?: string | null;

  @IsInt()
  @Min(0)
  @IsOptional()
  storyPoints?: number;

  @IsNumber()
  @IsOptional()
  position?: number;
}
