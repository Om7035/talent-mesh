import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  IsEnum,
  IsPositive,
  Min,
  Max,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { DifficultyLevel } from '@prisma/client';
import { Transform, Type } from 'class-transformer';

export class CreateProjectDto {
  @ApiProperty({ example: 'Build a SaaS Landing Page' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'We need a modern landing page for our SaaS product...' })
  @IsString()
  description: string;

  @ApiProperty({ example: 5000, description: 'Budget in INR' })
  @IsNumber()
  @IsPositive()
  budget: number;

  @ApiProperty({ example: 30, description: 'Timeline in days' })
  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(365)
  timelineDays: number;

  @ApiProperty({ enum: DifficultyLevel })
  @IsEnum(DifficultyLevel)
  difficulty: DifficultyLevel;

  @ApiProperty({ example: 'Web Development', enum: ['Web Development', 'Mobile Development', 'Design', 'Data & Analytics', 'AI/ML', 'Backend', 'Gaming', 'Other'] })
  @IsString()
  category: string;

  @ApiPropertyOptional({ example: 'One-time Project', enum: ['One-time Project', 'Ongoing', 'Part-time'] })
  @IsOptional()
  @IsString()
  projectType?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  ndaRequired?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Hide company name from applicants' })
  @IsOptional()
  @IsBoolean()
  hideClientName?: boolean;

  @ApiPropertyOptional({ example: 'Email', enum: ['Email', 'Direct Message', 'Video Call'] })
  @IsOptional()
  @IsString()
  communicationPref?: string;

  @ApiPropertyOptional({ type: [String], description: 'Array of Skill UUIDs' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  skillIds?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Array of skill names; created if they do not already exist' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skillNames?: string[];
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class ProjectQueryDto {
  @ApiPropertyOptional({ description: 'Search by title or description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'Web Development' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: DifficultyLevel })
  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficulty?: DifficultyLevel;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minBudget?: number;

  @ApiPropertyOptional({ example: 10000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxBudget?: number;

  @ApiPropertyOptional({ default: 'POSTED' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 12;

  @ApiPropertyOptional({ default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';
}
