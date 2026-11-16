import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  position?: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  labels?: any;
}

export class UpdateCardDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  coverColor?: string;

  @IsOptional()
  labels?: any;
}

export class MoveCardDto {
  @IsString()
  @IsNotEmpty()
  targetListId: string;

  @IsNumber()
  @IsNotEmpty()
  newPosition: number;
}
