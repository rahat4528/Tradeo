import { IsNotEmpty, IsString, IsNumber, Min, IsEnum, IsOptional, IsInt, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DealStage } from '@prisma/client';

export class CreateDealDto {
  @ApiProperty({ example: 'Enterprise Fleet Automation License' })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiProperty({ example: 120000 })
  @IsNumber()
  @Min(0)
  value!: number;

  @ApiProperty({ enum: DealStage, example: DealStage.LEAD, required: false })
  @IsOptional()
  @IsEnum(DealStage)
  stage?: DealStage;

  @ApiProperty({ example: 50, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  probability?: number;

  @ApiProperty({ example: 'company-uuid', required: false })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiProperty({ example: 'contact-uuid', required: false })
  @IsOptional()
  @IsString()
  contactId?: string;

  @ApiProperty({ example: '2026-12-31', required: false })
  @IsOptional()
  @IsString()
  closeDate?: string;
}
