import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSkillDto {
  @ApiProperty({
    description: 'Skill name (unique)',
    example: 'TypeScript',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Skill category, e.g. "Frontend", "Backend", "ML"',
    example: 'Backend',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;
}
