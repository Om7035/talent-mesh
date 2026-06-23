import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCollegeDto {
  @ApiProperty({ example: 'Indian Institute of Technology Bombay' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'iitb.ac.in', description: 'Email domain used for auto-verification' })
  @IsString()
  domain: string;

  @ApiPropertyOptional({ example: 'Powai' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Mumbai' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'India' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}
