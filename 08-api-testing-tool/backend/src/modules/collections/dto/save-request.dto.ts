import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { HttpMethod, BodyType, AuthType } from '@prisma/client';

export class SaveRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(HttpMethod)
  method: HttpMethod;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsOptional()
  headers?: any;

  @IsOptional()
  params?: any;

  @IsOptional()
  body?: string;

  @IsOptional()
  @IsEnum(BodyType)
  bodyType?: BodyType;

  @IsOptional()
  @IsEnum(AuthType)
  authType?: AuthType;

  @IsOptional()
  authConfig?: any;

  @IsOptional()
  assertions?: any;

  @IsOptional()
  @IsString()
  collectionId?: string;
}
