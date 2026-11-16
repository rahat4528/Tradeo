import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Severity } from '@prisma/client';

export class CreateAlertDto {
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @IsString()
  @IsNotEmpty()
  metricType: string;

  @IsString()
  @IsNotEmpty()
  operator: string;

  @IsNumber()
  threshold: number;

  @IsEnum(Severity)
  severity: Severity = Severity.WARNING;
}
