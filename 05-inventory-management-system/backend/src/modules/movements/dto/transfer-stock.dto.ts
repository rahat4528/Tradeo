import { IsNotEmpty, IsString, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferStockDto {
  @ApiProperty({ example: 'uuid-product-id' })
  @IsNotEmpty()
  @IsString()
  productId!: string;

  @ApiProperty({ example: 'uuid-source-wh' })
  @IsNotEmpty()
  @IsString()
  sourceWarehouseId!: string;

  @ApiProperty({ example: 'uuid-destination-wh' })
  @IsNotEmpty()
  @IsString()
  destinationWarehouseId!: string;

  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({ example: 'TR-2026-08', required: false })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({ example: 'Pre-holiday stock rebalance', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
