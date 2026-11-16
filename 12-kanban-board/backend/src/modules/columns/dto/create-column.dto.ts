import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateColumnDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  wipLimit?: number;

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
