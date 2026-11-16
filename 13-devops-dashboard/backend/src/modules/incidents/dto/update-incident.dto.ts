import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IncidentStatus } from '@prisma/client';

export class UpdateIncidentDto {
  @IsEnum(IncidentStatus)
  @IsNotEmpty()
  status: IncidentStatus;

  @IsString()
  @IsOptional()
  resolutionNotes?: string;
}
