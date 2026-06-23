import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class ContractsCronService {
  private readonly logger = new Logger(ContractsCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
  ) {}

  // In a real application, you would use @nestjs/schedule with @Cron()
  // @Cron('0 0 * * *') // Run daily at midnight
  async handleUnfundedTimeouts() {
    this.logger.log('Checking for unfunded contracts that need cancellation...');
    const timeoutDays = 3;
    const timeoutThreshold = new Date();
    timeoutThreshold.setDate(timeoutThreshold.getDate() - timeoutDays);

    const unfundedContracts = await this.prisma.contract.findMany({
      where: {
        status: 'ASSIGNED',
        createdAt: {
          lt: timeoutThreshold,
        },
        escrow: {
          isFunded: false,
        },
      },
    });

    for (const contract of unfundedContracts) {
      try {
        await this.prisma.contract.update({
          where: { id: contract.id },
          data: { status: 'CANCELLED' },
        });
        
        // Log audit or notify user here
        this.logger.log(`Auto-cancelled unfunded contract ${contract.id}`);
      } catch (error) {
        this.logger.error(`Failed to cancel contract ${contract.id}`, error);
      }
    }
  }

  // @Cron('0 0 * * *')
  async handleAutoApprovals() {
    this.logger.log('Checking for submitted deliverables that need auto-approval...');
    const reviewDays = 14;
    const reviewThreshold = new Date();
    reviewThreshold.setDate(reviewThreshold.getDate() - reviewDays);

    const pendingDeliverables = await this.prisma.contract.findMany({
      where: {
        status: 'SUBMITTED',
        submittedAt: {
          lt: reviewThreshold,
        },
      },
    });

    for (const contract of pendingDeliverables) {
      try {
        // Auto-approve by releasing escrow
        await this.walletService.releaseEscrow(contract.id, contract.studentId);
        
        await this.prisma.contract.update({
          where: { id: contract.id },
          data: { 
            status: 'RELEASED',
            completedAt: new Date(),
          },
        });
        
        this.logger.log(`Auto-approved contract ${contract.id}`);
      } catch (error) {
        this.logger.error(`Failed to auto-approve contract ${contract.id}`, error);
      }
    }
  }
}
