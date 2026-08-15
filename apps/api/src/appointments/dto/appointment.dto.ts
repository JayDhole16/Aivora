import { IsString, IsOptional, IsArray, ValidateNested, IsNumber, Min, Max, IsDateString, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAppointmentServiceDto {
  @ApiProperty({ example: 'Haircut' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Standard haircut service' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 30 })
  @IsNumber()
  @Min(1)
  @Max(480)
  durationMinutes: number;

  @ApiPropertyOptional({ example: 5, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(60)
  bufferBeforeMinutes?: number;

  @ApiPropertyOptional({ example: 5, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(60)
  bufferAfterMinutes?: number;

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceCents?: number;

  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;
}

export class UpdateAppointmentServiceDto {
  @ApiPropertyOptional({ example: 'Haircut' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'Standard haircut service' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(480)
  durationMinutes?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(60)
  bufferBeforeMinutes?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(60)
  bufferAfterMinutes?: number;

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceCents?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateStaffDto {
  @ApiProperty({ example: 'John Smith' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'john@salon.com' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ example: '+15551234567' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiProperty({ example: '{"monday": {"open": "09:00", "close": "17:00", "breaks": []}}' })
  @IsObject()
  workingHours: Record<string, any>;

  @ApiProperty({ type: [String], example: ['service-id-1'] })
  @IsArray()
  @IsString({ each: true })
  servicesOffered: string[];

  @ApiPropertyOptional({ example: 'calendar-connection-id' })
  @IsOptional()
  @IsString()
  calendarConnectionId?: string;
}

export class UpdateStaffDto {
  @ApiPropertyOptional({ example: 'John Smith' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'john@salon.com' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ example: '+15551234567' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({ example: '{"monday": {"open": "09:00", "close": "17:00", "breaks": []}}' })
  @IsOptional()
  @IsObject()
  workingHours?: Record<string, any>;

  @ApiPropertyOptional({ type: [String], example: ['service-id-1'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  servicesOffered?: string[];

  @ApiPropertyOptional({ example: 'calendar-connection-id' })
  @IsOptional()
  @IsString()
  calendarConnectionId?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AvailabilityQueryDto {
  @ApiProperty({ example: 'service-id-1' })
  @IsString()
  serviceId: string;

  @ApiPropertyOptional({ example: 'staff-id-1' })
  @IsOptional()
  @IsString()
  staffId?: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 'America/New_York' })
  @IsOptional()
  @IsString()
  timezone?: string;
}

export class CreateAppointmentDto {
  @ApiProperty({ example: 'service-id-1' })
  @IsString()
  serviceId: string;

  @ApiPropertyOptional({ example: 'staff-id-1' })
  @IsOptional()
  @IsString()
  staffId?: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  customerName: string;

  @ApiProperty({ example: '+15551234567' })
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  customerPhone: string;

  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  customerEmail?: string;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: 'America/New_York' })
  @IsString()
  timezone: string;

  @ApiPropertyOptional({ example: 'Please call when you arrive' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class UpdateAppointmentDto {
  @ApiPropertyOptional({ example: 'service-id-1' })
  @IsOptional()
  @IsString()
  serviceId?: string;

  @ApiPropertyOptional({ example: 'staff-id-1' })
  @IsOptional()
  @IsString()
  staffId?: string;

  @ApiPropertyOptional({ example: '2024-01-15T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({ example: 'America/New_York' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ example: 'confirmed', enum: ['pending', 'confirmed', 'cancelled', 'no_show', 'completed'] })
  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'cancelled', 'no_show', 'completed'])
  status?: 'pending' | 'confirmed' | 'cancelled' | 'no_show' | 'completed';

  @ApiPropertyOptional({ example: 'Customer requested reschedule' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}