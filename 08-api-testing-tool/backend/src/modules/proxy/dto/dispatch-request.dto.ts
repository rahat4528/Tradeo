import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { HttpMethod, BodyType, AuthType } from '@prisma/client';

export class AssertionRuleDto {
  type: 'STATUS_EQUALS' | 'RESPONSE_TIME_LT' | 'JSON_BODY_CONTAINS' | 'HEADER_EQUALS';
  target: string;
}

export class KeyValueEntryDto {
  key: string;
  value: string;
  enabled?: boolean;
}

export class DispatchRequestDto {
  @IsEnum(HttpMethod)
  @IsNotEmpty()
  method: HttpMethod;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsOptional()
  headers?: KeyValueEntryDto[] | Record<string, string>;

  @IsOptional()
  params?: KeyValueEntryDto[] | Record<string, string>;

  @IsOptional()
  body?: string;

  @IsOptional()
  @IsEnum(BodyType)
  bodyType?: BodyType;

  @IsOptional()
  @IsEnum(AuthType)
  authType?: AuthType;

  @IsOptional()
  authConfig?: {
    token?: string;
    username?: string;
    password?: string;
    key?: string;
    value?: string;
    addTo?: 'HEADER' | 'QUERY';
  };

  @IsOptional()
  @IsString()
  environmentId?: string;

  @IsOptional()
  assertions?: AssertionRuleDto[];
}
