import { IsNotEmpty, IsString, IsEnum, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MovementType } from '@prisma/client';

export class AdjustStockDto {
  @ApiProperty({ example: 'uuid-product-id' })
  @IsNotEmpty()
  @IsString()
  productId!: string;

  @ApiProperty({ example: 'uuid-warehouse-id' })
  @IsNotEmpty()
  @IsString()
  warehouseId!: string;

  @ApiProperty({ enum: MovementType, example: MovementType.ADJUSTMENT_IN })
  @IsNotEmpty()
  @IsEnum(MovementType)
  type!: MovementType;

  @ApiProperty({ example: 20 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({ example: 'Cycle Count Audit Q2', required: false })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({ example: 'Discrepancy resolved after physical pallet count', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
