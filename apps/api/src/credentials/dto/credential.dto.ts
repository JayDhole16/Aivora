import { IsString, IsEnum, IsOptional, IsObject, ValidateNested, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CredentialType } from '@aivora/shared-types';

export class CreateCredentialDto {
  @ApiProperty({ enum: CredentialType, example: 'twilio' })
  @IsEnum(CredentialType)
  type: CredentialType;

  @ApiProperty({ example: 'Twilio Production Account' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '{"accountSid": "ACxxx", "authToken": "xxx"}' })
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  secret: Record<string, any>;

  @ApiPropertyOptional({ example: '{"region": "us1"}' })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}

export class UpdateCredentialDto {
  @ApiPropertyOptional({ example: 'Twilio Production Account' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: '{"accountSid": "ACxxx", "authToken": "xxx"}' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  secret?: Record<string, any>;

  @ApiPropertyOptional({ example: '{"region": "us1"}' })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}

export class TestCredentialDto {
  @ApiPropertyOptional({ example: '{"to": "+15551234567"}' })
  @IsOptional()
  @IsObject()
  params?: Record<string, any>;
}