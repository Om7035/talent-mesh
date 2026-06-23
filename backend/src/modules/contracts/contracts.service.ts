import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ProjectStatus, Role } from '@prisma/client';
import { ReputationEngine } from '../recommendations/reputation.engine';
import { NotificationsService } from '../notifications/notifications.service';
import { SubmitDeliverableDto, ApproveDeliverableDto } from './dto/contract.dto';
import dayjs from 'dayjs';

/**
 * ContractsService — Implements the Escrow Contract State Machine.
 *
 * Valid State Transitions:
 *
 *   ASSIGNED ──fund()──► IN_PROGRESS
 *   IN_PROGRESS ──submit()──► SUBMITTED
 *   SUBMITTED ──approve()──► COMPLETED ──release()──► RELEASED
 *   [any active state] ──dispute()──► DISPUTED
 *   DISPUTED ──resolve()──► RELEASED | CANCELLED
 *
 * Each transition is validated before execution.
 * All state changes are atomic (wrapped in DB transactions).
 */
@Injectable()
export class ContractsService {
  private readonly logger = new Logger(ContractsService.name);

  /** Valid next states for each current state — encodes the state machine graph */
  private static readonly VALID_TRANSITIONS: Partial<Record<ProjectStatus, ProjectStatus[]>> = {
    [ProjectStatus.ASSIGNED]: [ProjectStatus.ESCROW_PENDING, ProjectStatus.CANCELLED],
    [ProjectStatus.ESCROW_PENDING]: [ProjectStatus.IN_PROGRESS, ProjectStatus.CANCELLED],
    [ProjectStatus.IN_PROGRESS]: [ProjectStatus.SUBMITTED, ProjectStatus.DISPUTED],
    [ProjectStatus.SUBMITTED]: [ProjectStatus.REVIEW, ProjectStatus.DISPUTED],
    [ProjectStatus.REVIEW]: [ProjectStatus.COMPLETED, ProjectStatus.REVISION_REQUESTED, ProjectStatus.DISPUTED],
    [ProjectStatus.REVISION_REQUESTED]: [ProjectStatus.SUBMITTED, ProjectStatus.DISPUTED],
    [ProjectStatus.COMPLETED]: [ProjectStatus.RELEASED],
    [ProjectStatus.DISPUTED]: [ProjectStatus.RELEASED, ProjectStatus.CANCELLED],
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly reputationEngine: ReputationEngine,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ─────────────────────────────────────────────────────────────────
  // CREATE CONTRACT (from accepted application)
  // ─────────────────────────────────────────────────────────────────

  async createFromApplication(applicationId: string, clientUserId: string) {
    const application = await this.prisma.projectApplication.findUnique({
      where: { id: applicationId },
      include: {
        project: { include: { client: true } },
        student: true,
      },
    });

    if (!application) throw new NotFoundException('Application not found.');
    if (application.status !== 'ACCEPTED') {
      throw new BadRequestException('Application must be ACCEPTED before creating a contract.');
    }

    // Verify the requesting user is the project owner
    const client = await this.prisma.client.findUnique({ where: { userId: clientUserId } });
    if (application.project.client.userId !== clientUserId) {
      throw new ForbiddenException('Only the project owner can create a contract.');
    }

    // Check for existing contract on this project
    const existingContract = await this.prisma.contract.findFirst({
      where: { projectId: application.projectId },
    });
    if (existingContract) {
      throw new ConflictException('A contract already exists for this project.');
    }

    const dueAt = dayjs().add(application.project.timelineDays, 'day').toDate();

    // Create contract + escrow record + update project status in a transaction
    return this.prisma.$transaction(async (tx) => {
      const contract = await tx.contract.create({
        data: {
          projectId: application.projectId,
          studentId: application.studentId,
          agreedBudget: application.proposedBudget ?? application.project.budget,
          timelineDays: application.project.timelineDays,
          status: ProjectStatus.ASSIGNED,
          dueAt,
        },
      });

      // Create escrow record (unfunded initially)
      const clientWallet = await tx.wallet.findUnique({ where: { userId: clientUserId } });
      if (!clientWallet) throw new BadRequestException('Client wallet not found.');

      const platformFee = Number(contract.agreedBudget) * 0.10; // 10% platform fee
      await tx.escrow.create({
        data: {
          contractId: contract.id,
          amount: contract.agreedBudget,
          platformFee,
          walletId: clientWallet.id,
        },
      });

      // Update project status
      await tx.project.update({
        where: { id: application.projectId },
        data: { status: ProjectStatus.ASSIGNED },
      });

      this.logger.log(`Contract created: ${contract.id} [project:${application.projectId}]`);

      // Notify student
      await this.notificationsService.send({
        userId: application.student.userId,
        type: 'CONTRACT_CREATED',
        title: '🎉 Contract Created!',
        message: `You've been hired for "${application.project.title}". Please wait for the client to fund escrow.`,
        actionUrl: `/student/projects/${contract.id}`,
      });

      return contract;
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // STUDENT ACCEPTS / REJECTS OFFER
  // ─────────────────────────────────────────────────────────────────

  async acceptOffer(contractId: string, studentUserId: string) {
    const contract = await this.getContractWithValidation(contractId);
    this.assertTransition(contract.status, ProjectStatus.ESCROW_PENDING);

    const student = await this.prisma.student.findUnique({ where: { userId: studentUserId } });
    if (!student || contract.studentId !== student.id) {
      throw new ForbiddenException('Only the assigned student can accept this offer.');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.contract.update({
        where: { id: contractId },
        data: { status: ProjectStatus.ESCROW_PENDING },
      });
      await tx.project.update({
        where: { id: contract.projectId },
        data: { status: ProjectStatus.ESCROW_PENDING },
      });
      return { message: 'Offer accepted. Awaiting client escrow funding.', contractId };
    });
  }

  async rejectOffer(contractId: string, studentUserId: string) {
    const contract = await this.getContractWithValidation(contractId);
    this.assertTransition(contract.status, ProjectStatus.CANCELLED);

    const student = await this.prisma.student.findUnique({ where: { userId: studentUserId } });
    if (!student || contract.studentId !== student.id) {
      throw new ForbiddenException('Only the assigned student can reject this offer.');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.contract.update({
        where: { id: contractId },
        data: { status: ProjectStatus.CANCELLED },
      });
      // Project goes back to APPLICATIONS_OPEN
      await tx.project.update({
        where: { id: contract.projectId },
        data: { status: ProjectStatus.APPLICATIONS_OPEN },
      });
      return { message: 'Offer rejected.', contractId };
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // FUND ESCROW (Client → Wallet debit → Escrow lock)
  // ─────────────────────────────────────────────────────────────────

  async fundEscrow(contractId: string, clientUserId: string) {
    const contract = await this.getContractWithValidation(contractId, true);
    this.assertTransition(contract.status, ProjectStatus.IN_PROGRESS);

    const client = await this.prisma.client.findUnique({ where: { userId: clientUserId } });
    if (!client || contract.project.clientId !== client.id) {
      throw new ForbiddenException('Only the project owner can fund this escrow.');
    }

    const escrow = await this.prisma.escrow.findUnique({
      where: { contractId },
      include: { wallet: true },
    });
    if (!escrow) throw new NotFoundException('Escrow record not found.');
    if (escrow.isFunded) throw new ConflictException('Escrow is already funded.');

    // Check wallet balance
    if (Number(escrow.wallet.balance) < Number(escrow.amount) + Number(escrow.platformFee)) {
      throw new BadRequestException(
        `Insufficient wallet balance. Required: ₹${(Number(escrow.amount) + Number(escrow.platformFee)).toFixed(2)}. ` +
        `Current Balance: ₹${Number(escrow.wallet.balance).toFixed(2)}`
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const totalRequired = Number(escrow.amount) + Number(escrow.platformFee);

      // Debit wallet with atomic conditional check
      const updatedWallets = await tx.wallet.updateMany({
        where: { 
          id: escrow.walletId,
          balance: { gte: totalRequired },
        },
        data: {
          balance: { decrement: totalRequired },
          lockedBalance: { increment: escrow.amount },
        },
      });

      if (updatedWallets.count === 0) {
        throw new BadRequestException('Insufficient balance or concurrent transaction blocked.');
      }

      // Record transaction
      await tx.transaction.create({
        data: {
          walletId: escrow.walletId,
          amount: Number(escrow.amount) + Number(escrow.platformFee),
          type: 'ESCROW_LOCK',
          status: 'SUCCESS',
          description: `Escrow funded for contract: ${contractId}`,
          reference: contractId,
        },
      });

      // Mark escrow as funded
      await tx.escrow.update({
        where: { contractId },
        data: { isFunded: true, fundedAt: new Date() },
      });

      // Transition contract state
      await tx.contract.update({
        where: { id: contractId },
        data: { status: ProjectStatus.IN_PROGRESS, startedAt: new Date() },
      });

      await tx.project.update({
        where: { id: contract.projectId },
        data: { status: ProjectStatus.IN_PROGRESS },
      });

      this.logger.log(`Escrow funded: ${contractId} — ₹${escrow.amount}`);
      return { message: 'Escrow funded. Project is now IN_PROGRESS.', contractId };
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // SUBMIT DELIVERABLE (Student)
  // ─────────────────────────────────────────────────────────────────

  async submitDeliverable(contractId: string, studentUserId: string, dto: SubmitDeliverableDto) {
    const contract = await this.getContractWithValidation(contractId);
    this.assertTransition(contract.status, ProjectStatus.SUBMITTED);

    // Verify student ownership
    const student = await this.prisma.student.findUnique({ where: { userId: studentUserId } });
    if (!student || contract.studentId !== student.id) {
      throw new ForbiddenException('Only the assigned student can submit deliverables.');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.deliverable.create({
        data: {
          contractId,
          submission: dto.submission,
          notes: dto.notes ?? null,
        },
      });

      await tx.contract.update({
        where: { id: contractId },
        data: { status: ProjectStatus.SUBMITTED, submittedAt: new Date() },
      });

      await tx.project.update({
        where: { id: contract.projectId },
        data: { status: ProjectStatus.SUBMITTED },
      });

      this.logger.log(`Deliverable submitted for contract: ${contractId}`);
      return { message: 'Deliverable submitted. Awaiting client review.', contractId };
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // APPROVE & RELEASE ESCROW (Client)
  // ─────────────────────────────────────────────────────────────────

  async approveAndRelease(contractId: string, clientUserId: string, dto: ApproveDeliverableDto) {
    const contract = await this.getContractWithValidation(contractId, true);
    this.assertTransition(contract.status, ProjectStatus.COMPLETED);

    // Verify client ownership
    const client = await this.prisma.client.findUnique({ where: { userId: clientUserId } });
    if (!client || contract.project.clientId !== client.id) {
      throw new ForbiddenException('Only the project client can approve deliverables.');
    }

    const escrow = await this.prisma.escrow.findUnique({ where: { contractId } });
    if (!escrow || !escrow.isFunded || escrow.isReleased) {
      throw new BadRequestException('Escrow is not in a releasable state.');
    }

    // Determine if delivery was on time
    const wasOnTime = contract.dueAt ? new Date() <= contract.dueAt : null;

    return this.prisma.$transaction(async (tx) => {
      // 1. Mark deliverable as accepted
      await tx.deliverable.updateMany({
        where: { contractId },
        data: { isAccepted: true, reviewedAt: new Date(), feedback: dto.feedback ?? null },
      });

      // 2. Transition contract to COMPLETED then RELEASED
      const completedAt = new Date();
      await tx.contract.update({
        where: { id: contractId },
        data: {
          status: ProjectStatus.RELEASED,
          completedAt,
          wasOnTime,
        },
      });

      await tx.project.update({
        where: { id: contract.projectId },
        data: { status: ProjectStatus.RELEASED },
      });

      // 3. Find student's wallet and credit earnings
      const studentWallet = await tx.wallet.findUnique({
        where: { userId: contract.student.userId },
      });
      if (!studentWallet) throw new BadRequestException('Student wallet not found.');

      await tx.wallet.update({
        where: { id: studentWallet.id },
        data: {
          balance: { increment: escrow.amount },
          totalEarnings: { increment: escrow.amount },
        } as any,
      });

      await tx.transaction.create({
        data: {
          walletId: studentWallet.id,
          amount: escrow.amount,
          type: 'ESCROW_RELEASE',
          status: 'SUCCESS',
          description: `Payment released for contract: ${contractId}`,
          reference: contractId,
        },
      });

      // 4. Release escrow record
      await tx.escrow.update({
        where: { contractId },
        data: {
          isReleased: true,
          releasedAt: new Date(),
        },
      });

      // 5. Unlock client wallet
      await tx.wallet.update({
        where: { id: escrow.walletId },
        data: { lockedBalance: { decrement: escrow.amount } },
      });

      // 6. Update student stats
      await tx.student.update({
        where: { id: contract.studentId },
        data: {
          projectsCompleted: { increment: 1 },
          totalEarnings: { increment: escrow.amount },
        },
      });

      // 6b. Update client stats
      await tx.client.update({
        where: { id: contract.project.clientId },
        data: {
          projectsCompleted: { increment: 1 },
          totalSpent: { increment: escrow.amount },
        },
      });

      this.logger.log(
        `Contract RELEASED: ${contractId} — ₹${escrow.amount} paid to student [onTime:${wasOnTime}]`,
      );

      // 7. Audit log
      await tx.auditLog.create({
        data: {
          userId: clientUserId,
          action: 'CONTRACT_RELEASED',
          resource: 'Contract',
          resourceId: contractId,
          metadata: { amount: escrow.amount, wasOnTime },
        },
      });

      return { message: 'Payment released successfully.', amount: escrow.amount, contractId };
    }).then(async (result) => {
      // 8. Async: Trigger reputation recalculation AFTER transaction commits
      await this.reputationEngine.enqueueRecalculation(contract.studentId, 1); // High priority

      // 9. Notify student
      await this.notificationsService.send({
        userId: contract.student.userId,
        type: 'PAYMENT_RELEASED',
        title: '💰 Payment Released!',
        message: `$${escrow.amount.toFixed(2)} has been credited to your wallet for "${contract.project.title}".`,
        actionUrl: `/student/wallet`,
      });

      return result;
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // FILE DISPUTE
  // ─────────────────────────────────────────────────────────────────

  async fileDispute(contractId: string, userId: string, reason: string, evidence?: string) {
    const contract = await this.getContractWithValidation(contractId);

    const allowedStatuses: ProjectStatus[] = [
      ProjectStatus.IN_PROGRESS,
      ProjectStatus.SUBMITTED,
      ProjectStatus.REVIEW,
    ];
    if (!allowedStatuses.includes(contract.status)) {
      throw new BadRequestException(`Cannot dispute a contract with status: ${contract.status}`);
    }

    const studentUser = await this.prisma.student.findUnique({ where: { id: contract.studentId } });
    const clientUser = await this.prisma.client.findUnique({ where: { userId } });
    const isContractStudent = studentUser?.userId === userId;
    const isContractClient = clientUser?.id === contract.project.clientId;

    if (!isContractStudent && !isContractClient) {
      throw new ForbiddenException('Only parties to this contract can file a dispute.');
    }

    return this.prisma.$transaction(async (tx) => {
      // Determine who's being disputed
      const student = await tx.student.findUnique({ where: { id: contract.studentId } });
      const isStudentFiling = student?.userId === userId;
      const filedAgainst = isStudentFiling
        ? contract.project.clientId
        : contract.studentId;

      const dispute = await tx.dispute.create({
        data: {
          contractId,
          filedById: userId,
          filedAgainst,
          reason,
          evidence: evidence ?? null,
        },
      });

      await tx.contract.update({
        where: { id: contractId },
        data: { status: ProjectStatus.DISPUTED },
      });

      await tx.project.update({
        where: { id: contract.projectId },
        data: { status: ProjectStatus.DISPUTED },
      });

      return dispute;
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // FIND CONTRACT
  // ─────────────────────────────────────────────────────────────────

  async findOne(contractId: string, userId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        project: {
          include: {
            client: { include: { user: { select: { name: true, email: true } } } },
            skills: { include: { skill: true } },
          },
        },
        student: { include: { user: { select: { name: true, email: true, avatarUrl: true } } } },
        escrow: true,
        deliverables: { orderBy: { submittedAt: 'desc' } },
        reviews: true,
        disputes: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!contract) throw new NotFoundException('Contract not found.');

    // Access control: only parties to the contract + admin can view
    const student = await this.prisma.student.findUnique({ where: { userId } });
    const client = await this.prisma.client.findUnique({ where: { userId } });
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } });

    const isStudent = student?.id === contract.studentId;
    const isClient = client?.id === contract.project.clientId;
    const isAdmin = user?.role === Role.ADMIN;

    if (!isStudent && !isClient && !isAdmin) {
      throw new ForbiddenException('Access denied to this contract.');
    }

    return contract;
  }

  async findByProjectId(projectId: string, userId: string) {
    const contractInfo = await this.prisma.contract.findFirst({
      where: { projectId },
      select: { id: true }
    });
    
    if (!contractInfo) throw new NotFoundException('Contract not found for this project.');
    
    return this.findOne(contractInfo.id, userId);
  }

  // ─────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────

  /**
   * Validates state machine transition using the allowed transitions map.
   * Throws BadRequestException if the transition is not permitted.
   */
  private assertTransition(currentStatus: ProjectStatus, targetStatus: ProjectStatus): void {
    const allowedNext = ContractsService.VALID_TRANSITIONS[currentStatus] ?? [];
    if (!allowedNext.includes(targetStatus)) {
      throw new BadRequestException(
        `Invalid state transition: ${currentStatus} → ${targetStatus}. ` +
        `Allowed transitions: ${allowedNext.join(', ') || 'none'}.`,
      );
    }
  }

  private async getContractWithValidation(contractId: string, includeProject = false) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        project: includeProject ? {
          include: { client: true }
        } : { select: { clientId: true, title: true } },
        student: includeProject ? { include: { user: true } } : { select: { userId: true } },
      },
    });
    if (!contract) throw new NotFoundException('Contract not found.');
    return contract;
  }
}
