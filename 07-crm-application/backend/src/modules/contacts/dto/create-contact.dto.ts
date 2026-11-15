import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({ example: 'Samantha' })
  @IsNotEmpty()
  @IsString()
  firstName!: string;

  @ApiProperty({ example: 'Reed' })
  @IsNotEmpty()
  @IsString()
  lastName!: string;

  @ApiProperty({ example: 'samantha@acmerobotics.io' })
  @IsEmail({}, { message: 'A valid email address is required.' })
  email!: string;

  @ApiProperty({ example: '+1 (415) 555-0182', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'VP of Manufacturing', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'company-id-uuid', required: false })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiProperty({ example: 'Inbound Web', required: false })
  @IsOptional()
  @IsString()
  leadSource?: string;
}
