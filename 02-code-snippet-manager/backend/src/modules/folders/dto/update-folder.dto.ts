import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFolderDto {
  @ApiProperty({ example: 'Data Structures & Algorithms', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'uuid-or-null', required: false })
  @IsOptional()
  @IsString()
  parentId?: string | null;
}
