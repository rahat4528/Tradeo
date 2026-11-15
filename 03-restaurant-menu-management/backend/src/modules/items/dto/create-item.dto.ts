import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class VariantOptionDto {
  @ApiProperty({ example: 'Large' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 4.50 })
  @IsNumber()
  priceDelta!: number;
}

export class VariantGroupDto {
  @ApiProperty({ example: 'Portion Size' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  minSelections?: number = 1;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  maxSelections?: number = 1;

  @ApiProperty({ type: [VariantOptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantOptionDto)
  options!: VariantOptionDto[];
}

export class CreateItemDto {
  @ApiProperty({ example: 'Wood-Fired Margherita Pizza' })
  @IsNotEmpty({ message: 'Item name is required.' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'San Marzano tomatoes, buffalo mozzarella, fresh basil', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 18.50 })
  @IsNumber({}, { message: 'Price must be a valid number.' })
  price!: number;

  @ApiProperty({ example: 16.00, required: false })
  @IsOptional()
  @IsNumber()
  promoPrice?: number;

  @ApiProperty({ example: 'https://cdn.example.com/pizza.jpg', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: 750, required: false })
  @IsOptional()
  @IsNumber()
  calories?: number;

  @ApiProperty({ example: 12, required: false })
  @IsOptional()
  @IsNumber()
  prepTimeMinutes?: number;

  @ApiProperty({ example: 'Bestseller', required: false })
  @IsOptional()
  @IsString()
  badge?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ example: 'Gluten,Dairy', required: false })
  @IsOptional()
  @IsString()
  allergens?: string;

  @ApiProperty({ example: 'Vegetarian', required: false })
  @IsOptional()
  @IsString()
  dietary?: string;

  @ApiProperty({ example: 'Flour, yeast, water, tomatoes, mozzarella, basil, olive oil', required: false })
  @IsOptional()
  @IsString()
  ingredients?: string;

  @ApiProperty({ type: [VariantGroupDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantGroupDto)
  variants?: VariantGroupDto[];
}
