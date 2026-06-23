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
exports.RecruitersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let RecruitersService = class RecruitersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async discoverTalent(query) {
        const { skills, collegeId, minReputation, page = 1, limit = 20 } = query;
        const where = { isActive: true, verificationStatus: 'VERIFIED' };
        if (collegeId)
            where.collegeId = collegeId;
        if (minReputation)
            where.reputationScore = { gte: minReputation };
        if (skills && skills.length > 0) {
            where.skills = { some: { skill: { name: { in: skills } } } };
        }
        const [students, total] = await Promise.all([
            this.prisma.student.findMany({
                where,
                include: {
                    user: { select: { name: true, avatarUrl: true } },
                    college: { select: { name: true } },
                    skills: { include: { skill: true } }
                },
                orderBy: { reputationScore: 'desc' },
                skip: (page - 1) * limit,
                take: limit
            }),
            this.prisma.student.count({ where })
        ]);
        return { students, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async shortlistStudent(recruiterUserId, studentId) {
        const student = await this.prisma.student.findUnique({ where: { id: studentId } });
        if (!student)
            throw new common_1.NotFoundException('Student not found');
        await this.prisma.auditLog.create({
            data: {
                userId: recruiterUserId,
                action: 'STUDENT_SHORTLISTED',
                resource: 'Student',
                resourceId: studentId
            }
        });
        return { message: 'Student shortlisted successfully' };
    }
    async getAnalytics(recruiterUserId) {
        const shortlistedCount = await this.prisma.auditLog.count({
            where: { userId: recruiterUserId, action: 'STUDENT_SHORTLISTED' }
        });
        return { shortlistedCount };
    }
};
exports.RecruitersService = RecruitersService;
exports.RecruitersService = RecruitersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecruitersService);
//# sourceMappingURL=recruiters.service.js.map