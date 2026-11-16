import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { IssuePriority, IssueType } from '@prisma/client';

export class CreateIssueDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(IssueType)
  @IsOptional()
  type?: IssueType = IssueType.STORY;

  @IsEnum(IssuePriority)
  @IsOptional()
  priority?: IssuePriority = IssuePriority.MEDIUM;

  @IsString()
  @IsOptional()
  statusId?: string;

  @IsString()
  @IsOptional()
  sprintId?: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsString()
  @IsOptional()
  assigneeId?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  storyPoints?: number;
}
