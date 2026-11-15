import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Appetizers & Starters' })
  @IsNotEmpty({ message: 'Category name is required.' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'Small plates to share', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
