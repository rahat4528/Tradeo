import { IsArray, ValidateNested, IsInt, Min, Max, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class DayScheduleItemDto {
  @ApiProperty({ example: 1, description: '0=Sun, 1=Mon, ..., 6=Sat' })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @ApiProperty({ example: '09:00' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'startTime must be in HH:mm 24-hour format.' })
  startTime!: string;

  @ApiProperty({ example: '17:00' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'endTime must be in HH:mm 24-hour format.' })
  endTime!: string;
}

export class SetScheduleDto {
  @ApiProperty({ type: [DayScheduleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DayScheduleItemDto)
  schedules!: DayScheduleItemDto[];
}
