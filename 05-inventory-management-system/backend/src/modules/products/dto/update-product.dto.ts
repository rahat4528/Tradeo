import { IsOptional, IsString, IsNumber, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiProperty({ example: 'Updated product title', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '0123456789012', required: false })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Fasteners', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: 'BOX', required: false })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ example: 9.00, required: false })
  @IsOptional()
  @IsNumber()
  costPrice?: number;

  @ApiProperty({ example: 21.50, required: false })
  @IsOptional()
  @IsNumber()
  sellingPrice?: number;

  @ApiProperty({ example: 30, required: false })
  @IsOptional()
  @IsInt()
  reorderPoint?: number;
}
