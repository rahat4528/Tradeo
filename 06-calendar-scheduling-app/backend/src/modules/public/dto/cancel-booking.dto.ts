import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelBookingDto {
  @ApiProperty({ example: 'Schedule conflict with client presentation', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}
