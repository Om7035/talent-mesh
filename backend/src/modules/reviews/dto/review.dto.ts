import { IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    description: 'Rating score from 1.0 to 5.0',
    minimum: 1,
    maximum: 5,
    example: 4.5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number; // Optional, will be calculated if not provided

  @IsNumber()
  @Min(1)
  @Max(5)
  communication?: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  quality?: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  timeliness?: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  professionalism?: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  technicalSkill?: number;

  @ApiProperty({
    description: 'Written feedback for the reviewee',
    example: 'Great collaboration and delivered on time.',
  })
  @IsString()
  feedback: string;
}
