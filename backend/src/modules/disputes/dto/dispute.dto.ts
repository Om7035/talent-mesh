import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum DisputeOutcome {
  RELEASE = 'RELEASE',
  REFUND = 'REFUND',
  SPLIT = 'SPLIT',
}

export class ResolveDisputeDto {
  @ApiProperty({
    description: 'Admin resolution notes explaining the decision',
    example: 'After reviewing evidence, the work was substantially complete.',
  })
  @IsString()
  resolution: string;

  @ApiProperty({
    description: 'Outcome of the dispute resolution',
    enum: DisputeOutcome,
    example: DisputeOutcome.RELEASE,
  })
  @IsEnum(DisputeOutcome)
  outcome: DisputeOutcome;
}
