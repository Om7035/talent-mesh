import { IsString, IsOptional, IsNumber, IsArray, IsUrl, Min, Max } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class UpdateStudentProfileDto {
  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsUrl() githubUrl?: string;
  @IsOptional() @IsUrl() linkedinUrl?: string;
  @IsOptional() @IsUrl() twitterUrl?: string;
  @IsOptional() @IsUrl() portfolioUrl?: string;
  @IsOptional() @IsNumber() @Min(1) @Max(6) yearOfStudy?: number;
  @IsOptional() @IsString() major?: string;
}

export class AddSkillDto {
  @IsOptional() @IsString() skillId?: string;
  @IsOptional() @IsString() skillName?: string;
  @ApiProperty({ enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] })
  @IsString() level: string;
}

export class AddCertificationDto {
  @IsString() name: string;
  @IsString() issuer: string;
  @IsString() issueDate: string;
  @IsOptional() @IsUrl() credentialUrl?: string;
}

export class StudentSearchDto {
  @IsOptional() @IsArray() skills?: string[];
  @IsOptional() @IsString() collegeId?: string;
  @IsOptional() @IsNumber() minReputation?: number;
  @IsOptional() @IsNumber() page?: number = 1;
  @IsOptional() @IsNumber() limit?: number = 20;
}
