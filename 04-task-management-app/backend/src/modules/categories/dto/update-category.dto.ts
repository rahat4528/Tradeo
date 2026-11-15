import { IsOptional, IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiProperty({ example: 'Product Engineering', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '#10B981', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ example: 'cpu', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
