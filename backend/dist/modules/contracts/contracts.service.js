"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ContractsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
const reputation_engine_1 = require("../recommendations/reputation.engine");
const notifications_service_1 = require("../notifications/notifications.service");
const dayjs_1 = __importDefault(require("dayjs"));
let ContractsService = ContractsService_1 = class ContractsService {
    constructor(prisma, reputationEngine, notificationsService) {
        this.prisma = prisma;
        this.reputationEngine = reputationEngine;
        this.notificationsService = notificationsService;
        this.logger = new common_1.Logger(ContractsService_1.name);
    }
    async createFromApplication(applicationId, clientUserId) {
        const application = await this.prisma.projectApplication.findUnique({
            where: { id: applicationId },
            include: {
                project: { include: { client: true } },
                student: true,
            },
        });
        if (!application)
            throw new common_1.NotFoundException('Application not found.');
        if (application.status !== 'ACCEPTED') {
            throw new common_1.BadRequestException('Application must be ACCEPTED before creating a contract.');
        }
        const client = await this.prisma.client.findUnique({ where: { userId: clientUserId } });
        if (application.project.client.userId !== clientUserId) {
            throw new common_1.ForbiddenException('Only the project owner can create a contract.');
        }
        const existingContract = await this.prisma.contract.findFirst({
            where: { projectId: application.projectId },
        });
        if (existingContract) {
            throw new common_1.ConflictException('A contract already exists for this project.');
        }
        const dueAt = (0, dayjs_1.default)().add(application.project.timelineDays, 'day').toDate();
        return this.prisma.$transaction(async (tx) => {
            const contract = await tx.contract.create({
                data: {
                    projectId: application.projectId,
                    studentId: application.studentId,
                    agreedBudget: application.proposedBudget ?? application.project.budget,
                    timelineDays: application.project.timelineDays,
                    status: client_1.ProjectStatus.ASSIGNED,
                    dueAt,
                },
            });
            const clientWallet = await tx.wallet.findUnique({ where: { userId: clientUserId } });
            if (!clientWallet)
                throw new common_1.BadRequestException('Client wallet not found.');
            const platformFee = Number(contract.agreedBudget) * 0.10;
            await tx.escrow.create({
                data: {
                    contractId: contract.id,
                    amount: contract.agreedBudget,
                    platformFee,
                    walletId: clientWallet.id,
                },
            });
            await tx.project.update({
                where: { id: application.projectId },
                data: { status: client_1.ProjectStatus.ASSIGNED },
            });
            this.logger.log(`Contract created: ${contract.id} [project:${application.projectId}]`);
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
    async acceptOffer(contractId, studentUserId) {
        const contract = await this.getContractWithValidation(contractId);
        this.assertTransition(contract.status, client_1.ProjectStatus.ESCROW_PENDING);
        const student = await this.prisma.student.findUnique({ where: { userId: studentUserId } });
        if (!student || contract.studentId !== student.id) {
            throw new common_1.ForbiddenException('Only the assigned student can accept this offer.');
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.contract.update({
                where: { id: contractId },
                data: { status: client_1.ProjectStatus.ESCROW_PENDING },
            });
            await tx.project.update({
                where: { id: contract.projectId },
                data: { status: client_1.ProjectStatus.ESCROW_PENDING },
            });
            return { message: 'Offer accepted. Awaiting client escrow funding.', contractId };
        });
    }
    async rejectOffer(contractId, studentUserId) {
        const contract = await this.getContractWithValidation(contractId);
        this.assertTransition(contract.status, client_1.ProjectStatus.CANCELLED);
        const student = await this.prisma.student.findUnique({ where: { userId: studentUserId } });
        if (!student || contract.studentId !== student.id) {
            throw new common_1.ForbiddenException('Only the assigned student can reject this offer.');
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.contract.update({
                where: { id: contractId },
                data: { status: client_1.ProjectStatus.CANCELLED },
            });
            await tx.project.update({
                where: { id: contract.projectId },
                data: { status: client_1.ProjectStatus.APPLICATIONS_OPEN },
            });
            return { message: 'Offer rejected.', contractId };
        });
    }
    async fundEscrow(contractId, clientUserId) {
        const contract = await this.getContractWithValidation(contractId, true);
        this.assertTransition(contract.status, client_1.ProjectStatus.IN_PROGRESS);
        const client = await this.prisma.client.findUnique({ where: { userId: clientUserId } });
        if (!client || contract.project.clientId !== client.id) {
            throw new common_1.ForbiddenException('Only the project owner can fund this escrow.');
        }
        const escrow = await this.prisma.escrow.findUnique({
            where: { contractId },
            include: { wallet: true },
        });
        if (!escrow)
            throw new common_1.NotFoundException('Escrow record not found.');
        if (escrow.isFunded)
            throw new common_1.ConflictException('Escrow is already funded.');
        if (Number(escrow.wallet.balance) < Number(escrow.amount) + Number(escrow.platformFee)) {
            throw new common_1.BadRequestException(`Insufficient wallet balance. Required: ₹${(Number(escrow.amount) + Number(escrow.platformFee)).toFixed(2)}. ` +
                `Current Balance: ₹${Number(escrow.wallet.balance).toFixed(2)}`);
        }
        return this.prisma.$transaction(async (tx) => {
            const totalRequired = Number(escrow.amount) + Number(escrow.platformFee);
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
                throw new common_1.BadRequestException('Insufficient balance or concurrent transaction blocked.');
            }
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
            await tx.escrow.update({
                where: { contractId },
                data: { isFunded: true, fundedAt: new Date() },
            });
            await tx.contract.update({
                where: { id: contractId },
                data: { status: client_1.ProjectStatus.IN_PROGRESS, startedAt: new Date() },
            });
            await tx.project.update({
                where: { id: contract.projectId },
                data: { status: client_1.ProjectStatus.IN_PROGRESS },
            });
            this.logger.log(`Escrow funded: ${contractId} — ₹${escrow.amount}`);
            return { message: 'Escrow funded. Project is now IN_PROGRESS.', contractId };
        });
    }
    async submitDeliverable(contractId, studentUserId, dto) {
        const contract = await this.getContractWithValidation(contractId);
        this.assertTransition(contract.status, client_1.ProjectStatus.SUBMITTED);
        const student = await this.prisma.student.findUnique({ where: { userId: studentUserId } });
        if (!student || contract.studentId !== student.id) {
            throw new common_1.ForbiddenException('Only the assigned student can submit deliverables.');
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
                data: { status: client_1.ProjectStatus.SUBMITTED, submittedAt: new Date() },
            });
            await tx.project.update({
                where: { id: contract.projectId },
                data: { status: client_1.ProjectStatus.SUBMITTED },
            });
            this.logger.log(`Deliverable submitted for contract: ${contractId}`);
            return { message: 'Deliverable submitted. Awaiting client review.', contractId };
        });
    }
    async approveAndRelease(contractId, clientUserId, dto) {
        const contract = await this.getContractWithValidation(contractId, true);
        this.assertTransition(contract.status, client_1.ProjectStatus.COMPLETED);
        const client = await this.prisma.client.findUnique({ where: { userId: clientUserId } });
        if (!client || contract.project.clientId !== client.id) {
            throw new common_1.ForbiddenException('Only the project client can approve deliverables.');
        }
        const escrow = await this.prisma.escrow.findUnique({ where: { contractId } });
        if (!escrow || !escrow.isFunded || escrow.isReleased) {
            throw new common_1.BadRequestException('Escrow is not in a releasable state.');
        }
        const wasOnTime = contract.dueAt ? new Date() <= contract.dueAt : null;
        return this.prisma.$transaction(async (tx) => {
            await tx.deliverable.updateMany({
                where: { contractId },
                data: { isAccepted: true, reviewedAt: new Date(), feedback: dto.feedback ?? null },
            });
            const completedAt = new Date();
            await tx.contract.update({
                where: { id: contractId },
                data: {
                    status: client_1.ProjectStatus.RELEASED,
                    completedAt,
                    wasOnTime,
                },
            });
            await tx.project.update({
                where: { id: contract.projectId },
                data: { status: client_1.ProjectStatus.RELEASED },
            });
            const studentWallet = await tx.wallet.findUnique({
                where: { userId: contract.student.userId },
            });
            if (!studentWallet)
                throw new common_1.BadRequestException('Student wallet not found.');
            await tx.wallet.update({
                where: { id: studentWallet.id },
                data: {
                    balance: { increment: escrow.amount },
                    totalEarnings: { increment: escrow.amount },
                },
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
            await tx.escrow.update({
                where: { contractId },
                data: {
                    isReleased: true,
                    releasedAt: new Date(),
                },
            });
            await tx.wallet.update({
                where: { id: escrow.walletId },
                data: { lockedBalance: { decrement: escrow.amount } },
            });
            await tx.student.update({
                where: { id: contract.studentId },
                data: {
                    projectsCompleted: { increment: 1 },
                    totalEarnings: { increment: escrow.amount },
                },
            });
            await tx.client.update({
                where: { id: contract.project.clientId },
                data: {
                    projectsCompleted: { increment: 1 },
                    totalSpent: { increment: escrow.amount },
                },
            });
            this.logger.log(`Contract RELEASED: ${contractId} — ₹${escrow.amount} paid to student [onTime:${wasOnTime}]`);
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
            await this.reputationEngine.enqueueRecalculation(contract.studentId, 1);
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
    async fileDispute(contractId, userId, reason, evidence) {
        const contract = await this.getContractWithValidation(contractId);
        const allowedStatuses = [
            client_1.ProjectStatus.IN_PROGRESS,
            client_1.ProjectStatus.SUBMITTED,
            client_1.ProjectStatus.REVIEW,
        ];
        if (!allowedStatuses.includes(contract.status)) {
            throw new common_1.BadRequestException(`Cannot dispute a contract with status: ${contract.status}`);
        }
        const studentUser = await this.prisma.student.findUnique({ where: { id: contract.studentId } });
        const clientUser = await this.prisma.client.findUnique({ where: { userId } });
        const isContractStudent = studentUser?.userId === userId;
        const isContractClient = clientUser?.id === contract.project.clientId;
        if (!isContractStudent && !isContractClient) {
            throw new common_1.ForbiddenException('Only parties to this contract can file a dispute.');
        }
        return this.prisma.$transaction(async (tx) => {
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
                data: { status: client_1.ProjectStatus.DISPUTED },
            });
            await tx.project.update({
                where: { id: contract.projectId },
                data: { status: client_1.ProjectStatus.DISPUTED },
            });
            return dispute;
        });
    }
    async findOne(contractId, userId) {
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
        if (!contract)
            throw new common_1.NotFoundException('Contract not found.');
        const student = await this.prisma.student.findUnique({ where: { userId } });
        const client = await this.prisma.client.findUnique({ where: { userId } });
        const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
        const isStudent = student?.id === contract.studentId;
        const isClient = client?.id === contract.project.clientId;
        const isAdmin = user?.role === client_1.Role.ADMIN;
        if (!isStudent && !isClient && !isAdmin) {
            throw new common_1.ForbiddenException('Access denied to this contract.');
        }
        return contract;
    }
    async findByProjectId(projectId, userId) {
        const contractInfo = await this.prisma.contract.findFirst({
            where: { projectId },
            select: { id: true }
        });
        if (!contractInfo)
            throw new common_1.NotFoundException('Contract not found for this project.');
        return this.findOne(contractInfo.id, userId);
    }
    assertTransition(currentStatus, targetStatus) {
        const allowedNext = ContractsService_1.VALID_TRANSITIONS[currentStatus] ?? [];
        if (!allowedNext.includes(targetStatus)) {
            throw new common_1.BadRequestException(`Invalid state transition: ${currentStatus} → ${targetStatus}. ` +
                `Allowed transitions: ${allowedNext.join(', ') || 'none'}.`);
        }
    }
    async getContractWithValidation(contractId, includeProject = false) {
        const contract = await this.prisma.contract.findUnique({
            where: { id: contractId },
            include: {
                project: includeProject ? {
                    include: { client: true }
                } : { select: { clientId: true, title: true } },
                student: includeProject ? { include: { user: true } } : { select: { userId: true } },
            },
        });
        if (!contract)
            throw new common_1.NotFoundException('Contract not found.');
        return contract;
    }
};
exports.ContractsService = ContractsService;
ContractsService.VALID_TRANSITIONS = {
    [client_1.ProjectStatus.ASSIGNED]: [client_1.ProjectStatus.ESCROW_PENDING, client_1.ProjectStatus.CANCELLED],
    [client_1.ProjectStatus.ESCROW_PENDING]: [client_1.ProjectStatus.IN_PROGRESS, client_1.ProjectStatus.CANCELLED],
    [client_1.ProjectStatus.IN_PROGRESS]: [client_1.ProjectStatus.SUBMITTED, client_1.ProjectStatus.DISPUTED],
    [client_1.ProjectStatus.SUBMITTED]: [client_1.ProjectStatus.REVIEW, client_1.ProjectStatus.DISPUTED],
    [client_1.ProjectStatus.REVIEW]: [client_1.ProjectStatus.COMPLETED, client_1.ProjectStatus.REVISION_REQUESTED, client_1.ProjectStatus.DISPUTED],
    [client_1.ProjectStatus.REVISION_REQUESTED]: [client_1.ProjectStatus.SUBMITTED, client_1.ProjectStatus.DISPUTED],
    [client_1.ProjectStatus.COMPLETED]: [client_1.ProjectStatus.RELEASED],
    [client_1.ProjectStatus.DISPUTED]: [client_1.ProjectStatus.RELEASED, client_1.ProjectStatus.CANCELLED],
};
exports.ContractsService = ContractsService = ContractsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        reputation_engine_1.ReputationEngine,
        notifications_service_1.NotificationsService])
], ContractsService);
//# sourceMappingURL=contracts.service.js.map