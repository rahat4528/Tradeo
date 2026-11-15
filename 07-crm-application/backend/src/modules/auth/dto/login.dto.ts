import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'victoria@vanguard.com' })
  @IsEmail({}, { message: 'A valid email is required.' })
  email!: string;

  @ApiProperty({ example: 'SecureCrmPass123!' })
  @IsNotEmpty({ message: 'Password is required.' })
  @IsString()
  password!: string;
}
