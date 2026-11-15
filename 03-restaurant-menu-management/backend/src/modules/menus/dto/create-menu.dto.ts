import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuDto {
  @ApiProperty({ example: 'Dinner À La Carte' })
  @IsNotEmpty({ message: 'Menu title is required.' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Evening dining selections', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiProperty({ example: '17:00', required: false })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiProperty({ example: '23:00', required: false })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiProperty({ example: '0,1,2,3,4,5,6', required: false })
  @IsOptional()
  @IsString()
  daysOfWeek?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
