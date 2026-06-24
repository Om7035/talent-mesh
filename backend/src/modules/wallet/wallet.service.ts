import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdatePayoutDetailsDto } from './dto/wallet.dto';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async getWallet(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
    if (!wallet) throw new NotFoundException('Wallet not found');
    return wallet;
  }

  async updatePayoutDetails(userId: string, dto: UpdatePayoutDetailsDto) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');

    return this.prisma.wallet.update({
      where: { userId },
      data: {
        ...(dto.bankName !== undefined && { bankName: dto.bankName }),
        ...(dto.accountNumber !== undefined && { accountNumber: dto.accountNumber }),
        ...(dto.routingNumber !== undefined && { routingNumber: dto.routingNumber }),
        ...(dto.upiId !== undefined && { upiId: dto.upiId }),
        ...(dto.payoutMethod !== undefined && { payoutMethod: dto.payoutMethod }),
      },
    });
  }

  async deposit(userId: string, amount: number, referenceId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new NotFoundException();

      // Idempotency Check
      if (referenceId) {
        const existingTx = await tx.transaction.findFirst({
          where: { walletId: wallet.id, reference: referenceId, type: 'DEPOSIT' }
        });
        if (existingTx) throw new Error('Duplicate payment');
      }

      const updatedWallet = await tx.wallet.update({
        where: { userId },
        data: { balance: { increment: amount } },
      });

      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          amount,
          type: 'DEPOSIT',
          status: 'SUCCESS',
          description: 'Account deposit via platform',
          reference: referenceId,
        },
      });

      return updatedWallet;
    });
  }

  async withdraw(userId: string, amount: number) {
    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new NotFoundException();

      if (Number(wallet.balance) < amount) {
        throw new BadRequestException('Insufficient available balance');
      }

      const updatedWallet = await tx.wallet.update({
        where: { userId },
        data: { balance: { decrement: amount } },
      });

      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          amount,
          type: 'WITHDRAWAL',
          status: 'SUCCESS',
          description: 'Account withdrawal to bank',
        },
      });

      return updatedWallet;
    });
  }

  async getTransactions(userId: string, page = 1, limit = 20) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException();

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.transaction.count({ where: { walletId: wallet.id } }),
    ]);

    return { transactions, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ESCROW OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────────

  async lockEscrow(clientUserId: string, contractId: string, amount: number) {
    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId: clientUserId } });
      if (!wallet) throw new NotFoundException('Wallet not found');

      if (Number(wallet.balance) < amount) {
        throw new BadRequestException('Insufficient balance to fund escrow');
      }

      // Deduct from balance, add to lockedBalance
      const updatedWallet = await tx.wallet.update({
        where: { userId: clientUserId },
        data: {
          balance: { decrement: amount },
          lockedBalance: { increment: amount },
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          amount,
          type: 'ESCROW_LOCK',
          status: 'SUCCESS',
          description: `Escrow locked for contract ${contractId}`,
          reference: contractId,
        },
      });

      // Create or update the actual Escrow record
      const platformFee = amount * 0.10; // 10% platform fee
      const escrow = await tx.escrow.upsert({
        where: { contractId },
        create: {
          contractId,
          amount,
          platformFee,
          isFunded: true,
          fundedAt: new Date(),
          walletId: wallet.id,
        },
        update: {
          amount,
          platformFee,
          isFunded: true,
          fundedAt: new Date(),
        },
      });

      return { wallet: updatedWallet, escrow };
    });
  }

  async releaseEscrow(contractId: string, studentUserId: string) {
    return this.prisma.$transaction(async (tx) => {
      const escrow = await tx.escrow.findUnique({
        where: { contractId },
        include: { contract: true },
      });

      if (!escrow || !escrow.isFunded) throw new BadRequestException('Escrow not funded');
      if (escrow.isReleased) throw new BadRequestException('Escrow already released');

      const clientWalletId = escrow.walletId;
      const studentWallet = await tx.wallet.findUnique({ where: { userId: studentUserId } });
      if (!studentWallet) throw new NotFoundException('Student wallet not found');

      // 1. Remove funds from client's locked balance
      await tx.wallet.update({
        where: { id: clientWalletId },
        data: { lockedBalance: { decrement: escrow.amount } },
      });

      // 2. Calculate payout
      const payoutAmount = Number(escrow.amount) - Number(escrow.platformFee);

      // 3. Add to student's balance
      await tx.wallet.update({
        where: { id: studentWallet.id },
        data: { balance: { increment: payoutAmount } },
      });

      // 4. Create Transactions
      await tx.transaction.create({
        data: {
          walletId: clientWalletId,
          amount: escrow.amount,
          type: 'ESCROW_RELEASE',
          status: 'SUCCESS',
          description: `Escrow released for contract ${contractId}`,
          reference: contractId,
        },
      });

      await tx.transaction.create({
        data: {
          walletId: studentWallet.id,
          amount: payoutAmount,
          type: 'DEPOSIT', // Treating payout as a deposit to student wallet
          status: 'SUCCESS',
          description: `Payment received for contract ${contractId}`,
          reference: contractId,
        },
      });

      await tx.transaction.create({
        data: {
          walletId: clientWalletId,
          amount: escrow.platformFee,
          type: 'PLATFORM_FEE',
          status: 'SUCCESS',
          description: `Platform fee for contract ${contractId}`,
          reference: contractId,
        },
      });

      // 5. Mark escrow as released
      const updatedEscrow = await tx.escrow.update({
        where: { id: escrow.id },
        data: {
          isReleased: true,
          releasedAt: new Date(),
        },
      });

      return updatedEscrow;
    });
  }

  async refundEscrow(contractId: string) {
    return this.prisma.$transaction(async (tx) => {
      const escrow = await tx.escrow.findUnique({ where: { contractId } });
      if (!escrow || !escrow.isFunded) throw new BadRequestException('Escrow not funded');
      if (escrow.isReleased) throw new BadRequestException('Escrow already released');

      // Move funds from lockedBalance back to balance
      await tx.wallet.update({
        where: { id: escrow.walletId },
        data: {
          lockedBalance: { decrement: escrow.amount },
          balance: { increment: escrow.amount },
        },
      });

      // Create refund transaction
      await tx.transaction.create({
        data: {
          walletId: escrow.walletId,
          amount: escrow.amount,
          type: 'REFUND',
          status: 'SUCCESS',
          description: `Refund for cancelled/disputed contract ${contractId}`,
          reference: contractId,
        },
      });

      // Mark escrow as released/closed conceptually, or just delete it/update it
      const updatedEscrow = await tx.escrow.update({
        where: { id: escrow.id },
        data: {
          isReleased: true, // we overload this flag, or we could add a `isRefunded`
          releasedAt: new Date(),
        },
      });

      return updatedEscrow;
    });
  }
}
