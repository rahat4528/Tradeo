import { IsOptional, IsString, IsInt, IsIn, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLinkDto {
  @ApiProperty({ example: 'https://example.com/updated', required: false })
  @IsOptional()
  @IsString()
  targetUrl?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 'new-password-or-empty-to-remove', required: false })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ example: '2026-12-31T23:59:59.000Z', required: false })
  @IsOptional()
  @IsDateString()
  expiresAt?: string | null;

  @ApiProperty({ example: 301, required: false })
  @IsOptional()
  @IsInt()
  @IsIn([301, 302, 307, 308], { message: 'Redirect code must be 301, 302, 307, or 308.' })
  redirectCode?: number;
}
