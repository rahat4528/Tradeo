import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { Environment } from '@prisma/client';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsEnum(Environment)
  @IsOptional()
  environment?: Environment = Environment.PRODUCTION;

  @IsInt()
  @Min(5)
  @IsOptional()
  intervalSeconds?: number = 30;
}
