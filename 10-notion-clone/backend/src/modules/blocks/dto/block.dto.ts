import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { BlockType } from '@prisma/client';

export class CreateBlockDto {
  @IsEnum(BlockType)
  type: BlockType;

  @IsString()
  content: string;

  @IsOptional()
  @IsNumber()
  position?: number;

  @IsOptional()
  properties?: any;
}

export class UpdateBlockDto {
  @IsOptional()
  @IsEnum(BlockType)
  type?: BlockType;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  properties?: any;
}

export class ReorderBlockDto {
  @IsNumber()
  @IsNotEmpty()
  newPosition: number;
}
