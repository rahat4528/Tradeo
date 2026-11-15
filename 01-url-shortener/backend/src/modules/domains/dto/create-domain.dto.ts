import { IsNotEmpty, IsString, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDomainDto {
  @ApiProperty({ example: 's.mybrand.com' })
  @IsNotEmpty({ message: 'Domain name is required.' })
  @IsString()
  @Matches(/^[a-zA-Z0-9][a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}$/, {
    message: 'Must be a valid hostname (e.g. links.example.com).',
  })
  domain!: string;

  @ApiProperty({ example: 'https://mybrand.com', required: false })
  @IsOptional()
  @IsString()
  fallbackUrl?: string;
}
