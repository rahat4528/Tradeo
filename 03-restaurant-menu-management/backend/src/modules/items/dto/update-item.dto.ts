import { IsOptional, IsString, IsNumber, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { VariantGroupDto } from './create-item.dto';

export class UpdateItemDto {
  @ApiProperty({ example: 'Truffle Tagliatelle', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Updated culinary notes', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 22.00, required: false })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ example: 19.50, required: false })
  @IsOptional()
  @IsNumber()
  promoPrice?: number | null;

  @ApiProperty({ example: 'https://cdn.example.com/item.jpg', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string | null;

  @ApiProperty({ example: 620, required: false })
  @IsOptional()
  @IsNumber()
  calories?: number | null;

  @ApiProperty({ example: 15, required: false })
  @IsOptional()
  @IsNumber()
  prepTimeMinutes?: number | null;

  @ApiProperty({ example: 'Chef Special', required: false })
  @IsOptional()
  @IsString()
  badge?: string | null;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ example: 'Gluten,Dairy', required: false })
  @IsOptional()
  @IsString()
  allergens?: string | null;

  @ApiProperty({ example: 'Vegetarian', required: false })
  @IsOptional()
  @IsString()
  dietary?: string | null;

  @ApiProperty({ example: 'Ingredients list', required: false })
  @IsOptional()
  @IsString()
  ingredients?: string | null;

  @ApiProperty({ type: [VariantGroupDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantGroupDto)
  variants?: VariantGroupDto[];
}
