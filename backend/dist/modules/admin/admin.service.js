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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let AdminService = class AdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPlatformStats() {
        const [totalUsers, totalProjects, totalContracts, totalRevenue, disputes, systemMetrics] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.project.count(),
            this.prisma.contract.count(),
            this.prisma.transaction.aggregate({ where: { type: 'PLATFORM_FEE', status: 'SUCCESS' }, _sum: { amount: true } }),
            this.prisma.dispute.count({ where: { status: 'OPEN' } }),
            this.prisma.systemMetrics.findFirst(),
        ]);
        return {
            totalUsers,
            totalProjects,
            totalContracts,
            totalRevenue: totalRevenue._sum.amount ?? 0,
            openDisputes: disputes,
            systemMetrics
        };
    }
    async getUsers(page = 1, limit = 20, role, search) {
        const where = {};
        if (role)
            where.role = role;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
            this.prisma.user.count({ where }),
        ]);
        return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async banUser(adminUserId, targetUserId, reason) {
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: targetUserId } });
            if (!user)
                throw new common_1.NotFoundException();
            const updated = await tx.user.update({ where: { id: targetUserId }, data: { isActive: false } });
            await tx.auditLog.create({
                data: {
                    userId: adminUserId,
                    action: 'USER_BANNED',
                    resource: 'User',
                    resourceId: targetUserId,
                    metadata: { reason }
                }
            });
            return updated;
        });
    }
    async createUser(adminUserId, data) {
        const bcrypt = require('bcryptjs');
        const passwordHash = await bcrypt.hash(data.password || 'TempPassword123!', 10);
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    name: data.name,
                    role: data.role || 'STUDENT',
                    passwordHash,
                    isActive: true
                }
            });
            await tx.wallet.create({
                data: { userId: user.id, balance: 0 }
            });
            await tx.auditLog.create({
                data: {
                    userId: adminUserId,
                    action: 'USER_CREATED',
                    resource: 'User',
                    resourceId: user.id,
                    metadata: { role: user.role }
                }
            });
            return user;
        });
    }
    async updateUser(adminUserId, targetUserId, data) {
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: targetUserId } });
            if (!user)
                throw new common_1.NotFoundException();
            const updated = await tx.user.update({
                where: { id: targetUserId },
                data: {
                    role: data.role,
                    isActive: data.isActive,
                    name: data.name
                }
            });
            await tx.auditLog.create({
                data: {
                    userId: adminUserId,
                    action: 'USER_UPDATED',
                    resource: 'User',
                    resourceId: targetUserId,
                    metadata: data
                }
            });
            return updated;
        });
    }
    async deleteUser(adminUserId, targetUserId) {
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: targetUserId } });
            if (!user)
                throw new common_1.NotFoundException();
            await tx.user.delete({ where: { id: targetUserId } });
            await tx.auditLog.create({
                data: {
                    userId: adminUserId,
                    action: 'USER_DELETED',
                    resource: 'User',
                    resourceId: targetUserId,
                }
            });
            return { success: true };
        });
    }
    async getModerationQueue() {
        return this.prisma.dispute.findMany({
            where: { status: 'OPEN' },
            include: { contract: true },
            orderBy: { createdAt: 'asc' }
        });
    }
    async getAuditLogs(page = 1, limit = 50) {
        return this.prisma.auditLog.findMany({
            include: { user: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map