import { IsNotEmpty, IsString, IsEmail, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: '2026-11-20' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in YYYY-MM-DD format.' })
  date!: string;

  @ApiProperty({ example: '10:00' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'startTime must be in HH:mm 24-hour format.' })
  startTime!: string;

  @ApiProperty({ example: 'Clara Oswald' })
  @IsNotEmpty()
  @IsString()
  inviteeName!: string;

  @ApiProperty({ example: 'clara@companion.org' })
  @IsEmail({}, { message: 'A valid invitee email address is required.' })
  inviteeEmail!: string;

  @ApiProperty({ example: 'America/New_York', required: false })
  @IsOptional()
  @IsString()
  inviteeTimezone?: string;

  @ApiProperty({ example: 'Discussing Q1 cloud expansion architecture', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
