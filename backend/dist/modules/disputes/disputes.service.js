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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisputesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
let DisputesService = class DisputesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.dispute.findMany({
            include: {
                contract: { include: { project: { select: { title: true } } } },
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findOne(disputeId, userId, role) {
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
        if (!dispute)
            throw new common_1.NotFoundException();
        if (role !== client_1.Role.ADMIN) {
            const isStudent = dispute.contract.student.userId === userId;
            const clientProfile = await this.prisma.client.findUnique({
                where: { id: dispute.contract.project.clientId }
            });
            const isClient = clientProfile?.userId === userId;
            if (!isStudent && !isClient)
                throw new common_1.ForbiddenException();
        }
        return dispute;
    }
    async resolve(adminUserId, disputeId, dto) {
        const dispute = await this.prisma.dispute.findUnique({
            where: { id: disputeId },
            include: { contract: { include: { escrow: true, project: true, student: true } } }
        });
        if (!dispute)
            throw new common_1.NotFoundException();
        if (dispute.status === client_1.DisputeStatus.RESOLVED)
            throw new common_1.BadRequestException('Dispute already resolved');
        const admin = await this.prisma.admin.findUnique({ where: { userId: adminUserId } });
        if (!admin)
            throw new common_1.ForbiddenException();
        return this.prisma.$transaction(async (tx) => {
            await tx.dispute.update({
                where: { id: disputeId },
                data: {
                    status: client_1.DisputeStatus.RESOLVED,
                    resolution: dto.resolution,
                    resolvedById: admin.id,
                    resolvedAt: new Date()
                }
            });
            let nextContractStatus = client_1.ProjectStatus.RELEASED;
            const escrow = dispute.contract.escrow;
            if (escrow && escrow.isFunded && !escrow.isReleased) {
                const studentWallet = await tx.wallet.findUnique({ where: { userId: dispute.contract.student.userId } });
                const clientWallet = await tx.wallet.findUnique({ where: { id: escrow.walletId } });
                if (dto.outcome === 'RELEASE') {
                    await tx.wallet.update({ where: { id: studentWallet.id }, data: { balance: { increment: escrow.amount } } });
                    await tx.wallet.update({ where: { id: clientWallet.id }, data: { lockedBalance: { decrement: escrow.amount } } });
                }
                else if (dto.outcome === 'REFUND') {
                    await tx.wallet.update({ where: { id: clientWallet.id }, data: { balance: { increment: escrow.amount }, lockedBalance: { decrement: escrow.amount } } });
                    nextContractStatus = client_1.ProjectStatus.CANCELLED;
                }
                else if (dto.outcome === 'SPLIT') {
                    const half = Number(escrow.amount) / 2;
                    await tx.wallet.update({ where: { id: studentWallet.id }, data: { balance: { increment: half } } });
                    await tx.wallet.update({ where: { id: clientWallet.id }, data: { balance: { increment: half }, lockedBalance: { decrement: escrow.amount } } });
                }
                await tx.escrow.update({ where: { contractId: dispute.contractId }, data: { isReleased: true, releasedAt: new Date() } });
            }
            else {
                nextContractStatus = client_1.ProjectStatus.CANCELLED;
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
};
exports.DisputesService = DisputesService;
exports.DisputesService = DisputesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DisputesService);
//# sourceMappingURL=disputes.service.js.map