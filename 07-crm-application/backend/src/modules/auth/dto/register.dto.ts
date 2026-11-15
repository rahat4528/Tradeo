import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'Vanguard Global Corp' })
  @IsNotEmpty({ message: 'Organization name is required.' })
  @IsString()
  organizationName!: string;

  @ApiProperty({ example: 'Victoria Stone' })
  @IsNotEmpty({ message: 'Full name is required.' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'victoria@vanguard.com' })
  @IsEmail({}, { message: 'A valid work email is required.' })
  email!: string;

  @ApiProperty({ example: 'SecureCrmPass123!' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  password!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.MANAGER, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
