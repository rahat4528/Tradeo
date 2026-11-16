import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateColumnDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  wipLimit?: number | null;

  @IsString()
  @IsOptional()
  policy?: string;

  @IsBoolean()
  @IsOptional()
  isTerminal?: boolean;

  @IsInt()
  @IsOptional()
  order?: number;
}
