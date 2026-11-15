import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'chef@bistrolumiere.local' })
  @IsEmail({}, { message: 'A valid email address is required.' })
  email!: string;

  @ApiProperty({ example: 'Chef123!@#' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  password!: string;

  @ApiProperty({ example: 'Chef Antoine', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Bistro Lumière' })
  @IsNotEmpty({ message: 'Restaurant name is required.' })
  @IsString()
  restaurantName!: string;

  @ApiProperty({ example: 'bistro-lumiere' })
  @IsNotEmpty({ message: 'Restaurant slug is required.' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug may only contain lowercase letters, numbers, and hyphens.' })
  restaurantSlug!: string;
}
