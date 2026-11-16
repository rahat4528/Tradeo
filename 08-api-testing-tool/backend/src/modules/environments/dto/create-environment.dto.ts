import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

export class EnvironmentVariableDto {
  key: string;
  value: string;
  isSecret?: boolean;
}

export class CreateEnvironmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  variables?: EnvironmentVariableDto[];

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
