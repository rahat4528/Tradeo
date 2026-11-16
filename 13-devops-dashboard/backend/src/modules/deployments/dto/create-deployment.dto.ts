import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Environment } from '@prisma/client';

export class CreateDeploymentDto {
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @IsString()
  @IsNotEmpty()
  version: string;

  @IsString()
  @IsNotEmpty()
  commitSha: string;

  @IsString()
  @IsOptional()
  branch?: string = 'main';

  @IsEnum(Environment)
  @IsOptional()
  environment?: Environment = Environment.PRODUCTION;

  @IsString()
  @IsOptional()
  deployer?: string = 'GitHub Actions';

  @IsString()
  @IsOptional()
  status?: string = 'SUCCESS';

  @IsInt()
  @IsOptional()
  durationSeconds?: number;
}
