import { IsEmail, IsEnum, IsOptional, IsString, MinLength, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class SignupDto {
  @ApiProperty({ example: 'Jane Doe', description: 'Full name of the user' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'jane@college.edu', description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Password (min 8 chars)' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ 
    enum: ['STUDENT', 'CLIENT', 'RECRUITER'], 
    description: 'User role (TPO and ADMIN are created internally)' 
  })
  @IsEnum(['STUDENT', 'CLIENT', 'RECRUITER'])
  role: 'STUDENT' | 'CLIENT' | 'RECRUITER';

  // ── Student-specific fields ──
  @ApiPropertyOptional({ example: 'university-uuid', description: 'College ID (required for STUDENT)' })
  @IsOptional()
  @IsString()
  collegeId?: string;

  @ApiPropertyOptional({ example: 'department-uuid', description: 'Department ID (optional for STUDENT)' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ example: 3, description: 'Year of study (STUDENT only)' })
  @IsOptional()
  yearOfStudy?: number;

  @ApiPropertyOptional({ example: '+91 98765 43210', description: 'Phone number (STUDENT only)' })
  @IsOptional()
  @IsString()
  phone?: string;

  // ── Client/Recruiter-specific fields ──
  @ApiPropertyOptional({ example: 'TechCorp Inc.', description: 'Company name (CLIENT/RECRUITER)' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ example: 'Technology', description: 'Industry (CLIENT/RECRUITER)' })
  @IsOptional()
  @IsString()
  industry?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'jane@college.edu' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'The refresh token obtained on login' })
  @IsString()
  refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'jane@college.edu' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Password reset token from email' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'NewSecurePass456!' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
