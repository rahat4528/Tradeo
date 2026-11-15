import { IsNotEmpty, IsString, IsBoolean, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOverrideDto {
  @ApiProperty({ example: '2026-12-25', description: 'YYYY-MM-DD date' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be formatted as YYYY-MM-DD.' })
  date!: string;

  @ApiProperty({ example: true, description: 'True if completely unavailable on this day' })
  @IsBoolean()
  isUnavailable!: boolean;

  @ApiProperty({ example: '10:00', required: false })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'startTime must be in HH:mm format.' })
  startTime?: string;

  @ApiProperty({ example: '14:00', required: false })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'endTime must be in HH:mm format.' })
  endTime?: string;
}
