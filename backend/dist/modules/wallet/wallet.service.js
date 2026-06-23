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
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let WalletService = class WalletService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getWallet(userId) {
        const wallet = await this.prisma.wallet.findUnique({
            where: { userId },
            include: {
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });
        if (!wallet)
            throw new common_1.NotFoundException('Wallet not found');
        return wallet;
    }
    async deposit(userId, amount, referenceId) {
        return this.prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findUnique({ where: { userId } });
            if (!wallet)
                throw new common_1.NotFoundException();
            if (referenceId) {
                const existingTx = await tx.transaction.findFirst({
                    where: { walletId: wallet.id, reference: referenceId, type: 'DEPOSIT' }
                });
                if (existingTx)
                    throw new Error('Duplicate payment');
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
    async withdraw(userId, amount) {
        return this.prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findUnique({ where: { userId } });
            if (!wallet)
                throw new common_1.NotFoundException();
            if (Number(wallet.balance) < amount) {
                throw new common_1.BadRequestException('Insufficient available balance');
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
    async getTransactions(userId, page = 1, limit = 20) {
        const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
        if (!wallet)
            throw new common_1.NotFoundException();
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
    async lockEscrow(clientUserId, contractId, amount) {
        return this.prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findUnique({ where: { userId: clientUserId } });
            if (!wallet)
                throw new common_1.NotFoundException('Wallet not found');
            if (Number(wallet.balance) < amount) {
                throw new common_1.BadRequestException('Insufficient balance to fund escrow');
            }
            const updatedWallet = await tx.wallet.update({
                where: { userId: clientUserId },
                data: {
                    balance: { decrement: amount },
                    lockedBalance: { increment: amount },
                },
            });
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
            const platformFee = amount * 0.10;
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
    async releaseEscrow(contractId, studentUserId) {
        return this.prisma.$transaction(async (tx) => {
            const escrow = await tx.escrow.findUnique({
                where: { contractId },
                include: { contract: true },
            });
            if (!escrow || !escrow.isFunded)
                throw new common_1.BadRequestException('Escrow not funded');
            if (escrow.isReleased)
                throw new common_1.BadRequestException('Escrow already released');
            const clientWalletId = escrow.walletId;
            const studentWallet = await tx.wallet.findUnique({ where: { userId: studentUserId } });
            if (!studentWallet)
                throw new common_1.NotFoundException('Student wallet not found');
            await tx.wallet.update({
                where: { id: clientWalletId },
                data: { lockedBalance: { decrement: escrow.amount } },
            });
            const payoutAmount = Number(escrow.amount) - Number(escrow.platformFee);
            await tx.wallet.update({
                where: { id: studentWallet.id },
                data: { balance: { increment: payoutAmount } },
            });
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
                    type: 'DEPOSIT',
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
    async refundEscrow(contractId) {
        return this.prisma.$transaction(async (tx) => {
            const escrow = await tx.escrow.findUnique({ where: { contractId } });
            if (!escrow || !escrow.isFunded)
                throw new common_1.BadRequestException('Escrow not funded');
            if (escrow.isReleased)
                throw new common_1.BadRequestException('Escrow already released');
            await tx.wallet.update({
                where: { id: escrow.walletId },
                data: {
                    lockedBalance: { decrement: escrow.amount },
                    balance: { increment: escrow.amount },
                },
            });
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
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WalletService);
//# sourceMappingURL=wallet.service.js.map