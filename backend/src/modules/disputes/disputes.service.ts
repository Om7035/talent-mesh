import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ResolveDisputeDto } from './dto/dispute.dto';
import { DisputeStatus, ProjectStatus, Role } from '@prisma/client';

@Injectable()
export class DisputesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.dispute.findMany({
      include: {
        contract: { include: { project: { select: { title: true } } } },
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(disputeId: string, userId: string, role: Role) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        contract: {
          include: {
            project: { select: { clientId: true, title: true } },
            student: { select: { userId: true } }
          }
        }
      }
    });

    if (!dispute) throw new NotFoundException();

    if (role !== Role.ADMIN) {
      const isStudent = dispute.contract.student.userId === userId;
      const clientProfile = await this.prisma.client.findUnique({ 
        where: { id: dispute.contract.project.clientId } 
      });
      const isClient = clientProfile?.userId === userId;
      if (!isStudent && !isClient) throw new ForbiddenException();
    }

    return dispute;
  }

  async resolve(adminUserId: string, disputeId: string, dto: ResolveDisputeDto) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: { contract: { include: { escrow: true, project: true, student: true } } }
    });

    if (!dispute) throw new NotFoundException();
    if (dispute.status === DisputeStatus.RESOLVED) throw new BadRequestException('Dispute already resolved');

    const admin = await this.prisma.admin.findUnique({ where: { userId: adminUserId } });
    if (!admin) throw new ForbiddenException();

    return this.prisma.$transaction(async (tx) => {
      await tx.dispute.update({
        where: { id: disputeId },
        data: {
          status: DisputeStatus.RESOLVED,
          resolution: dto.resolution,
          resolvedById: admin.id,
          resolvedAt: new Date()
        }
      });

      let nextContractStatus: ProjectStatus = ProjectStatus.RELEASED;
      
      // Handle the money logic based on outcome: RELEASE, REFUND, SPLIT
      const escrow = dispute.contract.escrow;
      if (escrow && escrow.isFunded && !escrow.isReleased) {
        const studentWallet = await tx.wallet.findUnique({ where: { userId: dispute.contract.student.userId } });
        const clientWallet = await tx.wallet.findUnique({ where: { id: escrow.walletId } });

        if (dto.outcome === 'RELEASE') {
           await tx.wallet.update({ where: { id: studentWallet!.id }, data: { balance: { increment: escrow.amount } } });
           await tx.wallet.update({ where: { id: clientWallet!.id }, data: { lockedBalance: { decrement: escrow.amount } } });
        } else if (dto.outcome === 'REFUND') {
           await tx.wallet.update({ where: { id: clientWallet!.id }, data: { balance: { increment: escrow.amount }, lockedBalance: { decrement: escrow.amount } } });
           nextContractStatus = ProjectStatus.CANCELLED;
        } else if (dto.outcome === 'SPLIT') {
           const half = Number(escrow.amount) / 2;
           await tx.wallet.update({ where: { id: studentWallet!.id }, data: { balance: { increment: half } } });
           await tx.wallet.update({ where: { id: clientWallet!.id }, data: { balance: { increment: half }, lockedBalance: { decrement: escrow.amount } } });
        }

        await tx.escrow.update({ where: { contractId: dispute.contractId }, data: { isReleased: true, releasedAt: new Date() } });
      } else {
        nextContractStatus = ProjectStatus.CANCELLED;
      }

      await tx.contract.update({
        where: { id: dispute.contractId },
        data: { status: nextContractStatus }
      });
      await tx.project.update({
        where: { id: dispute.contract.projectId },
        data: { status: nextContractStatus }
      });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'DISPUTE_RESOLVED',
          resource: 'Dispute',
          resourceId: disputeId,
          metadata: { outcome: dto.outcome, resolution: dto.resolution }
        }
      });

      return { message: 'Dispute resolved successfully' };
    });
  }
}
