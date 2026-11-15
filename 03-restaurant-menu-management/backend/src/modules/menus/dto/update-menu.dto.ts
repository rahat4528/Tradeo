import { IsOptional, IsString, IsBoolean, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMenuDto {
  @ApiProperty({ example: 'Dinner Menu', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiProperty({ example: '18:00', required: false })
  @IsOptional()
  @IsString()
  startTime?: string | null;

  @ApiProperty({ example: '23:30', required: false })
  @IsOptional()
  @IsString()
  endTime?: string | null;

  @ApiProperty({ example: '1,2,3,4,5', required: false })
  @IsOptional()
  @IsString()
  daysOfWeek?: string;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
