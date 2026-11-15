import { IsOptional, IsString, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSnippetDto {
  @ApiProperty({ example: 'Updated Hook Name', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'typescript', required: false })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ example: 'export const newCode = true;', required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ example: 'uuid-or-null', required: false })
  @IsOptional()
  @IsString()
  folderId?: string | null;

  @ApiProperty({ example: ['react', 'nextjs'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ example: 'Refactored hook to support initial values', required: false })
  @IsOptional()
  @IsString()
  versionSummary?: string;
}
