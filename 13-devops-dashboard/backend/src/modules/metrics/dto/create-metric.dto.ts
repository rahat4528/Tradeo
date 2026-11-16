import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class CreateMetricDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  cpuPercent: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  memoryPercent: number;

  @IsNumber()
  @Min(0)
  requestRate: number;

  @IsNumber()
  @Min(0)
  latencyMs: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  errorRate: number;
}
