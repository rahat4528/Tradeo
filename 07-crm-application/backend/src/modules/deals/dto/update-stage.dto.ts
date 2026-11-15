import { IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DealStage } from '@prisma/client';

export class UpdateStageDto {
  @ApiProperty({ enum: DealStage, example: DealStage.QUALIFIED })
  @IsNotEmpty()
  @IsEnum(DealStage)
  stage!: DealStage;
}
