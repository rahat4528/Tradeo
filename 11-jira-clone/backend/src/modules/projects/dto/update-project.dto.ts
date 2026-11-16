import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(64)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
