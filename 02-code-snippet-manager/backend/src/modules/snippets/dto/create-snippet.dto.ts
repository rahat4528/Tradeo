import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSnippetDto {
  @ApiProperty({ example: 'Debounce Hook in React' })
  @IsNotEmpty({ message: 'Title is required.' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Custom hook for debouncing input values', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'typescript', default: 'typescript', required: false })
  @IsOptional()
  @IsString()
  language?: string = 'typescript';

  @ApiProperty({ example: 'export function useDebounce() { ... }' })
  @IsNotEmpty({ message: 'Code content cannot be empty.' })
  @IsString()
  code!: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ example: 'uuid-folder-id', required: false })
  @IsOptional()
  @IsString()
  folderId?: string;

  @ApiProperty({ example: ['react', 'hooks'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
