import { IsOptional, IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiProperty({ example: 'Antipasti & Starters', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Updated category description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
