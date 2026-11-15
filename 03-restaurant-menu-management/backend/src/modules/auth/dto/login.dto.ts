import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'chef@bistrolumiere.local' })
  @IsEmail({}, { message: 'A valid email address is required.' })
  email!: string;

  @ApiProperty({ example: 'Chef123!@#' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required.' })
  password!: string;
}
