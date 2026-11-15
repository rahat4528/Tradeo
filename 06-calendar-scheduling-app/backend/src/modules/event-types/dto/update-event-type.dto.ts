import { IsString, IsInt, Min, Max, IsEnum, IsOptional, IsBoolean, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LocationType } from '@prisma/client';

export class UpdateEventTypeDto {
  @ApiProperty({ example: 'Updated Meeting Title', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'new-slug', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must contain only lowercase letters, numbers, and hyphens.' })
  slug?: string;

  @ApiProperty({ example: 'Updated agenda description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 45, required: false })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(720)
  durationMinutes?: number;

  @ApiProperty({ enum: LocationType, required: false })
  @IsOptional()
  @IsEnum(LocationType)
  locationType?: LocationType;

  @ApiProperty({ example: 'https://meet.google.com/abc', required: false })
  @IsOptional()
  @IsString()
  locationValue?: string;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  bufferBefore?: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  bufferAfter?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
