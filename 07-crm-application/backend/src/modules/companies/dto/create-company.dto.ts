import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CompanyTier } from '@prisma/client';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Acme Robotics Corp' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 'acmerobotics.io', required: false })
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiProperty({ example: 'Industrial Automation', required: false })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiProperty({ example: '+1 (415) 555-0100', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '100 Silicon Way, San Jose, CA', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 5000000, required: false })
  @IsOptional()
  @IsNumber()
  annualRevenue?: number;

  @ApiProperty({ enum: CompanyTier, example: CompanyTier.ENTERPRISE, required: false })
  @IsOptional()
  @IsEnum(CompanyTier)
  tier?: CompanyTier;
}
