import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ActivityType } from '@prisma/client';

export class CreateActivityDto {
  @ApiProperty({ enum: ActivityType, example: ActivityType.CALL })
  @IsEnum(ActivityType)
  type!: ActivityType;

  @ApiProperty({ example: 'Introductory Discovery Call' })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Discussed cloud migration objectives and Q1 timeline requirements.' })
  @IsNotEmpty()
  @IsString()
  body!: string;

  @ApiProperty({ example: 'deal-uuid', required: false })
  @IsOptional()
  @IsString()
  dealId?: string;

  @ApiProperty({ example: 'company-uuid', required: false })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiProperty({ example: 'contact-uuid', required: false })
  @IsOptional()
  @IsString()
  contactId?: string;
}
