import { IsString, IsOptional, IsObject, IsNumber, IsBoolean, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVoiceAgentConfigDto {
  @ApiProperty({ example: 'Sarah' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  personaName: string;

  @ApiProperty({ example: 'Hello! Thank you for calling Acme Corp. How can I help you today?' })
  @IsString()
  @MinLength(1)
  greetingScript: string;

  @ApiProperty({ example: '21m00Tcm4TlvDq8ikWAM' })
  @IsString()
  voiceId: string;

  @ApiPropertyOptional({ example: '+15551234567' })
  @IsOptional()
  @IsString()
  escalationNumber?: string;

  @ApiPropertyOptional({ example: '{"monday": {"open": "09:00", "close": "17:00", "breaks": []}}' })
  @IsOptional()
  @IsObject()
  businessHoursOverride?: Record<string, any>;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  bargeInEnabled?: boolean;

  @ApiPropertyOptional({ example: 300, default: 300 })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(3600)
  maxCallDurationSeconds?: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  recordingEnabled?: boolean;

  @ApiProperty({ example: 'This call may be recorded for quality purposes.' })
  @IsString()
  @MinLength(1)
  consentMessage: string;
}

export class UpdateVoiceAgentConfigDto {
  @ApiPropertyOptional({ example: 'Sarah' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  personaName?: string;

  @ApiPropertyOptional({ example: 'Hello! Thank you for calling Acme Corp. How can I help you today?' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  greetingScript?: string;

  @ApiPropertyOptional({ example: '21m00Tcm4TlvDq8ikWAM' })
  @IsOptional()
  @IsString()
  voiceId?: string;

  @ApiPropertyOptional({ example: '+15551234567' })
  @IsOptional()
  @IsString()
  escalationNumber?: string;

  @ApiPropertyOptional({ example: '{"monday": {"open": "09:00", "close": "17:00", "breaks": []}}' })
  @IsOptional()
  @IsObject()
  businessHoursOverride?: Record<string, any>;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  bargeInEnabled?: boolean;

  @ApiPropertyOptional({ example: 300 })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(3600)
  maxCallDurationSeconds?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  recordingEnabled?: boolean;

  @ApiPropertyOptional({ example: 'This call may be recorded for quality purposes.' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  consentMessage?: string;
}

export class PhoneNumberSearchDto {
  @ApiPropertyOptional({ example: '212' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  areaCode?: string;

  @ApiPropertyOptional({ example: 'US' })
  @IsOptional()
  @IsString()
  countryCode?: string;
}

export class PurchasePhoneNumberDto {
  @ApiProperty({ example: '+12125551234' })
  @IsString()
  phoneNumber: string;

  @ApiPropertyOptional({ example: 'Main Business Line' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  friendlyName?: string;

  @ApiPropertyOptional({ example: 'service-id-1' })
  @IsOptional()
  @IsString()
  serviceId?: string;
}

export class TwilioWebhookDto {
  @ApiProperty()
  CallSid: string;

  @ApiProperty()
  AccountSid: string;

  @ApiProperty()
  From: string;

  @ApiProperty()
  To: string;

  @ApiProperty()
  CallStatus: string;

  @ApiPropertyOptional()
  Direction?: string;

  @ApiPropertyOptional()
  RecordingUrl?: string;

  @ApiPropertyOptional()
  TranscriptionText?: string;

  @ApiPropertyOptional()
  RecordingDuration?: string;

  @ApiPropertyOptional()
  Digits?: string;

  @ApiPropertyOptional()
  SpeechResult?: string;

  @ApiPropertyOptional()
  Confidence?: string;
}

export class GoLiveCheckResponseDto {
  @ApiProperty({ example: true })
  canGoLive: boolean;

  @ApiProperty({ example: ['preview_opened', 'credentials_connected'] })
  checks: {
    previewOpened: boolean;
    credentialsConnected: boolean;
  };
}