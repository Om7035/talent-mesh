import { Controller, Get, Post, Patch, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { DepositDto, WithdrawDto, UpdatePayoutDetailsDto } from './dto/wallet.dto';
import * as crypto from 'crypto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Role } from '@prisma/client';
import { Headers, BadRequestException } from '@nestjs/common';

@ApiTags('wallet')
@ApiBearerAuth('JWT')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiOperation({ summary: 'Get current wallet balance and recent transactions' })
  getMyWallet(@CurrentUser() user: JwtPayload) {
    return this.walletService.getWallet(user.sub);
  }

  @Patch('payout-details')
  @ApiOperation({ summary: 'Update bank/UPI payout details' })
  updatePayoutDetails(@CurrentUser() user: JwtPayload, @Body() dto: UpdatePayoutDetailsDto) {
    return this.walletService.updatePayoutDetails(user.sub, dto);
  }

  @Post('deposit-order')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create Razorpay Order for Deposit' })
  async createDepositOrder(@CurrentUser() user: JwtPayload, @Body() dto: DepositDto) {
    // In production, instantiate Razorpay and call instance.orders.create(...)
    // For now, we return a mock order to fulfill the frontend requirement
    const amountInPaise = dto.amount * 100;
    const mockOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;
    
    return {
      orderId: mockOrderId,
      amount: amountInPaise,
      currency: 'INR',
    };
  }

  @Post('deposit-verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Razorpay Payment and deposit funds' })
  async verifyDeposit(@CurrentUser() user: JwtPayload, @Body() body: any) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = body;
    
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'fallback_secret')
                                  .update(razorpay_order_id + '|' + razorpay_payment_id)
                                  .digest('hex');
    
    if (expectedSignature !== razorpay_signature) {
      throw new BadRequestException('Invalid signature');
    }
    
    return this.walletService.deposit(user.sub, amount, razorpay_payment_id);
  }

  @Post('direct-deposit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Direct deposit for testing and ease of use' })
  async directDeposit(@CurrentUser() user: JwtPayload, @Body() dto: DepositDto) {
    const mockPaymentId = `dep_${crypto.randomBytes(6).toString('hex')}`;
    return this.walletService.deposit(user.sub, dto.amount, mockPaymentId);
  }

  @Public()
  @Post('razorpay-webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Razorpay Webhook listener with idempotency' })
  async handleWebhook(@Headers('x-razorpay-signature') signature: string, @Body() payload: any) {
    if (!signature) throw new BadRequestException('Missing signature');

    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'fallback_secret')
                                  .update(JSON.stringify(payload))
                                  .digest('hex');

    if (expectedSignature !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    if (payload.event === 'payment.captured') {
      const amount = payload.payload.payment.entity.amount / 100;
      const paymentId = payload.payload.payment.entity.id;
      const notes = payload.payload.payment.entity.notes || {};
      
      if (notes.userId) {
        try {
          await this.walletService.deposit(notes.userId, amount, paymentId);
          console.log(`Webhook: Payment ${paymentId} captured for user ${notes.userId}`);
        } catch (err: any) {
          if (err.message === 'Duplicate payment') {
            console.log(`Webhook: Payment ${paymentId} already processed.`);
            return { status: 'ok', note: 'Idempotency caught duplicate' };
          }
          throw err;
        }
      }
    }
    return { status: 'ok' };
  }


  @Post('withdraw')
  @Roles(Role.STUDENT, Role.CLIENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Withdraw funds from wallet' })
  withdraw(@CurrentUser() user: JwtPayload, @Body() dto: WithdrawDto) {
    return this.walletService.withdraw(user.sub, dto.amount);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get paginated transaction history' })
  getTransactions(
    @CurrentUser() user: JwtPayload,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.walletService.getTransactions(user.sub, Number(page), Number(limit));
  }
}
