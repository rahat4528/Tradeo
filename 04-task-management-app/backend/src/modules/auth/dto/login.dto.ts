import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'developer@tradeo.io' })
  @IsEmail({}, { message: 'A valid email address is required.' })
  email!: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsNotEmpty({ message: 'Password is required.' })
  @IsString()
  password!: string;
}
