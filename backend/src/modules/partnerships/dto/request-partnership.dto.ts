import { IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestPartnershipDto {
  @ApiProperty({ required: false, description: 'Required if caller is RECRUITER' })
  @IsOptional()
  @IsUUID()
  collegeId?: string;

  @ApiProperty({ required: false, description: 'Required if caller is TPO' })
  @IsOptional()
  @IsUUID()
  recruiterId?: string;
}
