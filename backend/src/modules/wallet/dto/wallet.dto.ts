import { IsNumber, IsPositive, IsOptional, IsString, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

export class UpdatePayoutDetailsDto {
  @ApiPropertyOptional({ example: 'HDFC Bank' })
  @IsOptional() @IsString() bankName?: string;

  @ApiPropertyOptional({ example: '1234567890' })
  @IsOptional() @IsString() accountNumber?: string;

  @ApiPropertyOptional({ example: 'HDFC0001234' })
  @IsOptional() @IsString() routingNumber?: string;

  @ApiPropertyOptional({ example: 'username@upi' })
  @IsOptional() @IsString() upiId?: string;

  @ApiPropertyOptional({ enum: ['BANK_TRANSFER', 'UPI'] })
  @IsOptional() @IsIn(['BANK_TRANSFER', 'UPI']) payoutMethod?: string;
}
