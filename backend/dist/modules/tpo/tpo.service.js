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
exports.TpoService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
let TpoService = class TpoService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCollegeStudents(tpoUserId, page = 1, limit = 20) {
        const tpo = await this.prisma.tPO.findUnique({ where: { userId: tpoUserId } });
        if (!tpo)
            throw new common_1.ForbiddenException();
        const [students, total] = await Promise.all([
            this.prisma.student.findMany({
                where: { collegeId: tpo.collegeId },
                select: {
                    id: true,
                    user: { select: { name: true, email: true, avatarUrl: true } },
                    department: { select: { name: true } },
                    reputationScore: true,
                    projectsCompleted: true,
                    totalEarnings: true,
                    verificationStatus: true,
                    clusterTier: true,
                },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.student.count({ where: { collegeId: tpo.collegeId } }),
        ]);
        return { students, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async getCollegeAnalyticsSummary(tpoUserId) {
        const tpo = await this.prisma.tPO.findUnique({ where: { userId: tpoUserId } });
        if (!tpo)
            throw new common_1.ForbiddenException();
        const students = await this.prisma.student.findMany({
            where: { collegeId: tpo.collegeId },
            include: { skills: { include: { skill: true } } }
        });
        const totalStudents = students.length;
        const avgReputation = students.reduce((sum, s) => sum + s.reputationScore, 0) / (totalStudents || 1);
        const totalEarnings = students.reduce((sum, s) => sum + Number(s.totalEarnings), 0);
        return { totalStudents, avgReputation, totalEarnings };
    }
    async getPendingVerifications(tpoUserId) {
        const tpo = await this.prisma.tPO.findUnique({ where: { userId: tpoUserId } });
        if (!tpo)
            throw new common_1.ForbiddenException();
        return this.prisma.student.findMany({
            where: { collegeId: tpo.collegeId, verificationStatus: client_1.VerificationStatus.PENDING },
            include: { user: true, department: true }
        });
    }
    async verifyStudent(tpoUserId, studentId) {
        const tpo = await this.prisma.tPO.findUnique({ where: { userId: tpoUserId } });
        if (!tpo)
            throw new common_1.ForbiddenException();
        const student = await this.prisma.student.findUnique({ where: { id: studentId } });
        if (!student)
            throw new common_1.NotFoundException('Student not found');
        if (student.collegeId !== tpo.collegeId)
            throw new common_1.ForbiddenException('You can only manage students from your own college.');
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.student.update({
                where: { id: studentId },
                data: { verificationStatus: client_1.VerificationStatus.VERIFIED, verifiedAt: new Date(), verifiedByTpoId: tpo.id }
            });
            await tx.auditLog.create({
                data: {
                    userId: tpo.userId,
                    action: 'STUDENT_VERIFIED',
                    resource: 'Student',
                    resourceId: studentId,
                }
            });
            return updated;
        });
    }
    async rejectStudent(tpoUserId, studentId, reason) {
        const tpo = await this.prisma.tPO.findUnique({ where: { userId: tpoUserId } });
        if (!tpo)
            throw new common_1.ForbiddenException();
        const student = await this.prisma.student.findUnique({ where: { id: studentId } });
        if (!student)
            throw new common_1.NotFoundException('Student not found');
        if (student.collegeId !== tpo.collegeId)
            throw new common_1.ForbiddenException('You can only manage students from your own college.');
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.student.update({
                where: { id: studentId },
                data: { verificationStatus: client_1.VerificationStatus.REJECTED, verifiedByTpoId: tpo.id }
            });
            await tx.auditLog.create({
                data: {
                    userId: tpo.userId,
                    action: 'STUDENT_REJECTED',
                    resource: 'Student',
                    resourceId: studentId,
                    metadata: { reason }
                }
            });
            return updated;
        });
    }
    async generateReport(tpoUserId) {
        return this.getCollegeAnalyticsSummary(tpoUserId);
    }
};
exports.TpoService = TpoService;
exports.TpoService = TpoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TpoService);
//# sourceMappingURL=tpo.service.js.map