import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryProductsDto {
  @ApiProperty({ example: 'bolt', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ example: 'Fasteners', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  lowStockOnly?: boolean;

  @ApiProperty({ example: 'uuid', required: false })
  @IsOptional()
  @IsString()
  warehouseId?: string;
}
