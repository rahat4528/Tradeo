import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFolderDto {
  @ApiProperty({ example: 'Algorithms' })
  @IsNotEmpty({ message: 'Folder name is required.' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'uuid', required: false })
  @IsOptional()
  @IsString()
  parentId?: string;
}
