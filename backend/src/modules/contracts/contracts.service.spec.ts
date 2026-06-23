import { Test, TestingModule } from '@nestjs/testing';
import { ContractsService } from './contracts.service';
import { PrismaService } from '../../database/prisma.service';
import { ReputationEngine } from '../recommendations/reputation.engine';
import { NotificationsService } from '../notifications/notifications.service';
import { BadRequestException } from '@nestjs/common';
import { ProjectStatus } from '@prisma/client';

describe('ContractsService - Wallet Race Condition', () => {
  let service: ContractsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractsService,
        {
          provide: PrismaService,
          useValue: {
            contract: { findUnique: jest.fn(), update: jest.fn() },
            escrow: { findUnique: jest.fn(), update: jest.fn() },
            project: { update: jest.fn() },
            $transaction: jest.fn(),
          },
        },
        { provide: ReputationEngine, useValue: {} },
        { provide: NotificationsService, useValue: {} },
      ],
    }).compile();

    service = module.get<ContractsService>(ContractsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should prevent negative balances on concurrent fundEscrow calls via atomic check', async () => {
    (prismaService.contract.findUnique as jest.Mock).mockResolvedValue({
      id: 'contract-1',
      status: ProjectStatus.ESCROW_PENDING,
      project: { clientId: 'client-1' }
    });

    (prismaService.escrow.findUnique as jest.Mock).mockResolvedValue({
      contractId: 'contract-1',
      walletId: 'wallet-1',
      amount: 100,
      platformFee: 10,
      isFunded: false,
      wallet: { balance: 200 }
    });

    const mockUpdateMany = jest.fn()
      .mockResolvedValueOnce({ count: 1 }) // First call succeeds
      .mockResolvedValueOnce({ count: 0 }); // Second call fails (0 count due to where clause)

    (prismaService.$transaction as jest.Mock).mockImplementation(async (cb) => {
       return cb({
         wallet: { updateMany: mockUpdateMany },
         transaction: { create: jest.fn() },
         escrow: { update: jest.fn() },
         contract: { update: jest.fn() },
         project: { update: jest.fn() }
       });
    });

    const req1 = service.fundEscrow('contract-1', 'client-1');
    const req2 = service.fundEscrow('contract-1', 'client-1');

    const results = await Promise.allSettled([req1, req2]);

    const successes = results.filter(r => r.status === 'fulfilled');
    const failures = results.filter(r => r.status === 'rejected');
    
    expect(successes.length).toBe(1);
    expect(failures.length).toBe(1);
    expect((failures[0] as PromiseRejectedResult).reason.message).toContain('Insufficient balance');
  });
});
