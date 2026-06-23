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
exports.StudentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let StudentsService = class StudentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
        const student = await this.prisma.student.findUnique({
            where: { userId },
            include: {
                user: { select: { name: true, email: true, avatarUrl: true } },
                college: true,
                department: true,
                skills: { include: { skill: true } },
                certifications: true,
                leaderboard: true,
                contracts: {
                    where: { status: { in: ['COMPLETED', 'RELEASED'] } },
                    include: { project: true },
                    take: 5,
                    orderBy: { completedAt: 'desc' },
                },
            },
        });
        if (!student)
            throw new common_1.NotFoundException('Student profile not found');
        return student;
    }
    async updateProfile(userId, dto) {
        return this.prisma.student.update({
            where: { userId },
            data: dto,
        });
    }
    async addSkill(userId, dto) {
        const student = await this.prisma.student.findUnique({ where: { userId } });
        if (!student)
            throw new common_1.NotFoundException('Student not found');
        let skillId = dto.skillId;
        if (!skillId && dto.skillName) {
            const skill = await this.prisma.skill.upsert({
                where: { name: dto.skillName },
                update: {},
                create: { name: dto.skillName },
            });
            skillId = skill.id;
        }
        if (!skillId)
            throw new Error('Skill ID or Name required');
        return this.prisma.studentSkill.upsert({
            where: { studentId_skillId: { studentId: student.id, skillId } },
            update: { level: dto.level },
            create: { studentId: student.id, skillId, level: dto.level },
        });
    }
    async removeSkill(userId, skillId) {
        const student = await this.prisma.student.findUnique({ where: { userId } });
        if (!student)
            return;
        return this.prisma.studentSkill.delete({
            where: { studentId_skillId: { studentId: student.id, skillId } },
        });
    }
    async addCertification(userId, dto) {
        const student = await this.prisma.student.findUnique({ where: { userId } });
        if (!student)
            throw new common_1.NotFoundException();
        return this.prisma.certification.create({
            data: {
                studentId: student.id,
                name: dto.name,
                issuer: dto.issuer,
                issueDate: new Date(dto.issueDate),
                credentialUrl: dto.credentialUrl,
            },
        });
    }
    async getPortfolio(studentId) {
        return this.prisma.contract.findMany({
            where: { studentId, status: { in: ['COMPLETED', 'RELEASED'] } },
            include: {
                project: true,
                reviews: { where: { revieweeId: studentId } },
            },
            orderBy: { completedAt: 'desc' },
        });
    }
    async incrementProfileViews(studentId) {
        this.prisma.student.update({
            where: { id: studentId },
            data: { profileViews: { increment: 1 } },
        }).catch(() => { });
    }
    async searchStudents(query) {
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
                    skills: { include: { skill: true } },
                },
                orderBy: { reputationScore: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.student.count({ where }),
        ]);
        return { students, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async verifyStudent(studentId, tpoUserId) {
        const tpo = await this.prisma.tPO.findUnique({ where: { userId: tpoUserId } });
        if (!tpo)
            throw new common_1.NotFoundException('TPO not found');
        const student = await this.prisma.student.findUnique({ where: { id: studentId } });
        if (!student)
            throw new common_1.NotFoundException('Student not found');
        if (student.collegeId !== tpo.collegeId) {
            throw new common_1.ForbiddenException('You can only verify students from your own college.');
        }
        return this.prisma.student.update({
            where: { id: studentId },
            data: {
                verificationStatus: 'VERIFIED',
                verifiedAt: new Date(),
                verifiedByTpoId: tpo.id,
            },
        });
    }
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StudentsService);
//# sourceMappingURL=students.service.js.map