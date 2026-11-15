import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Engineering' })
  @IsNotEmpty({ message: 'Category name is required.' })
  @IsString()
  name!: string;

  @ApiProperty({ example: '#3B82F6', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ example: 'code', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
