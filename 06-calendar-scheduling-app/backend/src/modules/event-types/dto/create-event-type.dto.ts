import { IsNotEmpty, IsString, IsInt, Min, Max, IsEnum, IsOptional, IsBoolean, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LocationType } from '@prisma/client';

export class CreateEventTypeDto {
  @ApiProperty({ example: '30 Min Discovery Meeting' })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiProperty({ example: 'discovery-meeting' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must contain only lowercase letters, numbers, and hyphens.' })
  slug!: string;

  @ApiProperty({ example: 'Initial collaboration call.', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 30 })
  @IsInt()
  @Min(5)
  @Max(720)
  durationMinutes!: number;

  @ApiProperty({ enum: LocationType, example: LocationType.GOOGLE_MEET })
  @IsEnum(LocationType)
  locationType!: LocationType;

  @ApiProperty({ example: 'https://meet.google.com/xyz', required: false })
  @IsOptional()
  @IsString()
  locationValue?: string;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  bufferBefore?: number;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  bufferAfter?: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  minNoticeHours?: number;

  @ApiProperty({ example: 60, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxDaysNotice?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
