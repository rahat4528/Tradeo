import { IsUrl, IsNotEmpty, IsOptional, IsString, IsInt, IsIn, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLinkDto {
  @ApiProperty({ example: 'https://example.com/very/long/url' })
  @IsNotEmpty({ message: 'Target URL is required.' })
  @IsString()
  targetUrl!: string;

  @ApiProperty({ example: 'launch-2026', required: false })
  @IsOptional()
  @IsString()
  customAlias?: string;

  @ApiProperty({ example: 'Product launch campaign', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'optional-secret-pass', required: false })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ example: '2026-12-31T23:59:59.000Z', required: false })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiProperty({ example: 307, required: false, default: 307 })
  @IsOptional()
  @IsInt()
  @IsIn([301, 302, 307, 308], { message: 'Redirect code must be 301, 302, 307, or 308.' })
  redirectCode?: number;

  @ApiProperty({ example: 'uuid', required: false })
  @IsOptional()
  @IsString()
  domainId?: string;
}
