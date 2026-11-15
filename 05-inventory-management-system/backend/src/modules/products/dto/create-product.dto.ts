import { IsNotEmpty, IsString, IsOptional, IsNumber, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'FAST-M8-BOLT-100PK' })
  @IsNotEmpty({ message: 'SKU is required.' })
  @IsString()
  sku!: string;

  @ApiProperty({ example: 'Grade 8.8 M8 Hex Bolts (Pack of 100)' })
  @IsNotEmpty({ message: 'Product title is required.' })
  @IsString()
  name!: string;

  @ApiProperty({ example: '0123456789012', required: false })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({ example: 'Zinc-plated metric hex bolts', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Fasteners', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: 'BOX', default: 'PCS', required: false })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ example: 8.50, default: 0.0, required: false })
  @IsOptional()
  @IsNumber()
  costPrice?: number;

  @ApiProperty({ example: 19.99, default: 0.0, required: false })
  @IsOptional()
  @IsNumber()
  sellingPrice?: number;

  @ApiProperty({ example: 25, default: 10, required: false })
  @IsOptional()
  @IsInt()
  reorderPoint?: number;

  @ApiProperty({ example: 'uuid-warehouse-id', required: false })
  @IsOptional()
  @IsString()
  initialWarehouseId?: string;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @IsInt()
  initialStock?: number;
}
