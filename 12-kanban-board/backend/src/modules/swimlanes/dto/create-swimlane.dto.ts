import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSwimlaneDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  @IsOptional()
  order?: number;
}
