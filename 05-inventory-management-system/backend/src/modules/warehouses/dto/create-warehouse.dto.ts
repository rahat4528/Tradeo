import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWarehouseDto {
  @ApiProperty({ example: 'WH-EAST' })
  @IsNotEmpty({ message: 'Warehouse code is required.' })
  @IsString()
  code!: string;

  @ApiProperty({ example: 'East Coast Distribution Center' })
  @IsNotEmpty({ message: 'Warehouse name is required.' })
  @IsString()
  name!: string;

  @ApiProperty({ example: '400 Logistics Blvd, Newark NJ', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: '+1 (555) 234-5678', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}
