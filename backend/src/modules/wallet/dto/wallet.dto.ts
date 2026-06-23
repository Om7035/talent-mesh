import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DepositDto {
  @ApiProperty({ example: 1000 })
  @IsNumber()
  @IsPositive()
  amount: number;
}

export class WithdrawDto {
  @ApiProperty({ example: 500 })
  @IsNumber()
  @IsPositive()
  amount: number;
}
