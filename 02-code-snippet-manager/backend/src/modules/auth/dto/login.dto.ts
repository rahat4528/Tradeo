import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'engineer@tradeo.local' })
  @IsEmail({}, { message: 'A valid email address is required.' })
  email!: string;

  @ApiProperty({ example: 'Snippets123!@#' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required.' })
  password!: string;
}
