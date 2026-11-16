import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BlockCardDto {
  @IsBoolean()
  @IsNotEmpty()
  isBlocked: boolean;

  @IsString()
  @IsOptional()
  blockReason?: string;
}
