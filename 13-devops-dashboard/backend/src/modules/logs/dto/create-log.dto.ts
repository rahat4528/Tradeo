import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { LogLevel } from '@prisma/client';

export class CreateLogDto {
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @IsEnum(LogLevel)
  level: LogLevel = LogLevel.INFO;

  @IsString()
  @IsNotEmpty()
  message: string;
}
