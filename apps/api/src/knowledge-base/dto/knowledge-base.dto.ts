import { IsString, IsOptional, IsObject, IsArray, ValidateNested, MinLength, MaxLength, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateKnowledgeBaseEntryDto {
  @ApiProperty({ example: 'Return Policy' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'Our return policy allows returns within 30 days...' })
  @IsString()
  @MinLength(1)
  content: string;

  @ApiPropertyOptional({ example: '{"category": "policy", "tags": ["returns", "refunds"]}' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateKnowledgeBaseEntryDto {
  @ApiPropertyOptional({ example: 'Return Policy' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ example: 'Our return policy allows returns within 30 days...' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  content?: string;

  @ApiPropertyOptional({ example: '{"category": "policy", "tags": ["returns", "refunds"]}' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class SearchKnowledgeBaseDto {
  @ApiProperty({ example: 'How do I return an item?' })
  @IsString()
  @MinLength(1)
  query: string;

  @ApiPropertyOptional({ example: 5, default: 5 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  topK?: number;

  @ApiPropertyOptional({ example: 0.7, default: 0.7 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  threshold?: number;
}

export class DocumentUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}

export class CandidateKBEntryDto {
  @ApiProperty({ example: 'Return Policy' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Our return policy allows returns within 30 days...' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ example: '{"category": "policy"}' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class BulkCreateKBEntriesDto {
  @ApiProperty({ type: [CandidateKBEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CandidateKBEntryDto)
  entries: CandidateKBEntryDto[];
}