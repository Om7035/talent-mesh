import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from '@prisma/client';

export class CreateApplicationDto {
  @IsOptional() @IsString() coverLetter?: string;
  @IsOptional() @IsNumber() proposedBudget?: number;
}

export class UpdateApplicationStatusDto {
  @ApiProperty({ enum: ['SHORTLISTED', 'REJECTED', 'ACCEPTED'] })
  @IsEnum(['SHORTLISTED', 'REJECTED', 'ACCEPTED'])
  status: ApplicationStatus;
}
