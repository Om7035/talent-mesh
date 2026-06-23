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
var ContractsCronService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractsCronService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const wallet_service_1 = require("../wallet/wallet.service");
let ContractsCronService = ContractsCronService_1 = class ContractsCronService {
    constructor(prisma, walletService) {
        this.prisma = prisma;
        this.walletService = walletService;
        this.logger = new common_1.Logger(ContractsCronService_1.name);
    }
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
                this.logger.log(`Auto-cancelled unfunded contract ${contract.id}`);
            }
            catch (error) {
                this.logger.error(`Failed to cancel contract ${contract.id}`, error);
            }
        }
    }
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
                await this.walletService.releaseEscrow(contract.id, contract.studentId);
                await this.prisma.contract.update({
                    where: { id: contract.id },
                    data: {
                        status: 'RELEASED',
                        completedAt: new Date(),
                    },
                });
                this.logger.log(`Auto-approved contract ${contract.id}`);
            }
            catch (error) {
                this.logger.error(`Failed to auto-approve contract ${contract.id}`, error);
            }
        }
    }
};
exports.ContractsCronService = ContractsCronService;
exports.ContractsCronService = ContractsCronService = ContractsCronService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        wallet_service_1.WalletService])
], ContractsCronService);
//# sourceMappingURL=contracts.cron.js.map