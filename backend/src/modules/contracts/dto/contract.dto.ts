import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitDeliverableDto {
  @ApiProperty({ description: 'Deliverable content (rich text or URL to submitted work)' })
  @IsString()
  submission: string;

  @ApiPropertyOptional({ description: 'Additional notes for the client' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ApproveDeliverableDto {
  @ApiPropertyOptional({ description: 'Feedback for the student on their submission' })
  @IsOptional()
  @IsString()
  feedback?: string;
}

export class FileDisputeDto {
  @ApiProperty({ description: 'Reason for filing the dispute' })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ description: 'Evidence (URL or descriptive text)' })
  @IsOptional()
  @IsString()
  evidence?: string;
}
