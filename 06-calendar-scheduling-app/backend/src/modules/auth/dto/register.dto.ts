import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'alex-mercer' })
  @IsNotEmpty({ message: 'Username is required.' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'Username must contain only lowercase letters, numbers, and hyphens.' })
  username!: string;

  @ApiProperty({ example: 'Alex Mercer' })
  @IsNotEmpty({ message: 'Full name is required.' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'alex@timesync.io' })
  @IsEmail({}, { message: 'A valid email address is required.' })
  email!: string;

  @ApiProperty({ example: 'SecureHostPass123!' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  password!: string;

  @ApiProperty({ example: 'America/New_York', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;
}
