import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRestaurantDto {
  @ApiProperty({ example: 'Bistro Lumière', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Artisanal seasonal bistro', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'USD', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: '123 Gourmet Ave, NY', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: '+1 (555) 123-4567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'https://cdn.tradeo.local/header.jpg', required: false })
  @IsOptional()
  @IsString()
  headerImageUrl?: string;
}
