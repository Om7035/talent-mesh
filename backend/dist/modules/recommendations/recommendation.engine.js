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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RecommendationEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationEngine = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const prisma_service_1 = require("../../database/prisma.service");
const queues_constants_1 = require("../../common/constants/queues.constants");
let RecommendationEngine = RecommendationEngine_1 = class RecommendationEngine {
    constructor(recommendationsQueue, prisma) {
        this.recommendationsQueue = recommendationsQueue;
        this.prisma = prisma;
        this.logger = new common_1.Logger(RecommendationEngine_1.name);
    }
    async enqueueForProject(projectId) {
        await this.recommendationsQueue.add(queues_constants_1.JOB_NAMES.RECOMMENDATIONS.GENERATE_FOR_PROJECT, { projectId }, { jobId: `rec:project:${projectId}`, delay: 5000 });
    }
    async enqueueForStudent(studentId) {
        await this.recommendationsQueue.add(queues_constants_1.JOB_NAMES.RECOMMENDATIONS.GENERATE_FOR_STUDENT, { studentId }, { jobId: `rec:student:${studentId}`, delay: 3000 });
    }
    async generateForStudent(studentId) {
        const student = await this.prisma.student.findUnique({
            where: { id: studentId },
            include: {
                skills: { include: { skill: true } },
                contracts: {
                    where: { status: { in: ['COMPLETED', 'RELEASED'] } },
                    include: { project: { select: { difficulty: true } } },
                    take: 20,
                },
            },
        });
        if (!student)
            return;
        const studentSkillIds = new Set(student.skills.map((s) => s.skillId));
        const studentReputationNormalized = student.reputationScore / 100;
        const completedDifficulties = student.contracts.map((c) => RecommendationEngine_1.DIFFICULTY_WEIGHTS[c.project.difficulty] ?? 2);
        const avgStudentDifficulty = completedDifficulties.length > 0
            ? completedDifficulties.reduce((a, b) => a + b, 0) / completedDifficulties.length
            : 2;
        const projects = await this.prisma.project.findMany({
            where: { status: 'PUBLISHED' },
            include: { skills: { include: { skill: true } } },
        });
        const recommendations = [];
        for (const project of projects) {
            const projectSkillIds = new Set(project.skills.map((s) => s.skillId));
            const intersection = [...studentSkillIds].filter((id) => projectSkillIds.has(id)).length;
            const union = new Set([...studentSkillIds, ...projectSkillIds]).size;
            const skillOverlap = union > 0 ? intersection / union : 0;
            const projectDifficultyWeight = RecommendationEngine_1.DIFFICULTY_WEIGHTS[project.difficulty] ?? 2;
            const difficultyDistance = Math.abs(avgStudentDifficulty - projectDifficultyWeight);
            const difficultyScore = Math.max(0, 1 - difficultyDistance / 3);
            let tierBonus = 0;
            if (student.clusterTier === 'ELITE')
                tierBonus = 0.15;
            else if (student.clusterTier === 'PROFESSIONAL')
                tierBonus = 0.10;
            else if (student.clusterTier === 'RISING_TALENT')
                tierBonus = 0.05;
            const rawScore = (RecommendationEngine_1.WEIGHTS.skillOverlap * skillOverlap) +
                (RecommendationEngine_1.WEIGHTS.reputation * studentReputationNormalized) +
                (RecommendationEngine_1.WEIGHTS.difficultyCompatibility * difficultyScore) +
                tierBonus;
            const matchScore = Math.round(rawScore * 100 * 100) / 100;
            if (matchScore > 10) {
                recommendations.push({
                    studentId,
                    projectId: project.id,
                    matchScore,
                    skillMatchScore: Math.round(skillOverlap * 100 * 100) / 100,
                    reputationScore: Math.round(studentReputationNormalized * 100 * 100) / 100,
                    difficultyScore: Math.round(difficultyScore * 100 * 100) / 100,
                });
            }
        }
        if (recommendations.length > 0) {
            await Promise.all(recommendations.map((rec) => this.prisma.recommendation.upsert({
                where: { studentId_projectId: { studentId: rec.studentId, projectId: rec.projectId } },
                create: rec,
                update: {
                    matchScore: rec.matchScore,
                    skillMatchScore: rec.skillMatchScore,
                    reputationScore: rec.reputationScore,
                    difficultyScore: rec.difficultyScore,
                    updatedAt: new Date(),
                },
            })));
            this.logger.debug(`Generated ${recommendations.length} recommendations for student: ${studentId}`);
        }
    }
    async getForStudent(studentId, limit = 10) {
        return this.prisma.recommendation.findMany({
            where: { studentId },
            orderBy: { matchScore: 'desc' },
            take: limit,
            include: {
                project: {
                    include: {
                        skills: { include: { skill: true } },
                        client: {
                            select: {
                                companyName: true,
                                user: { select: { name: true } },
                            },
                        },
                    },
                },
            },
        });
    }
    async getForProject(projectId, limit = 10) {
        return this.prisma.recommendation.findMany({
            where: { projectId },
            orderBy: { matchScore: 'desc' },
            take: limit,
            include: {
                student: {
                    include: {
                        user: { select: { name: true, avatarUrl: true } },
                        skills: { include: { skill: true } },
                        college: { select: { name: true } },
                    },
                },
            },
        });
    }
};
exports.RecommendationEngine = RecommendationEngine;
RecommendationEngine.WEIGHTS = {
    skillOverlap: 0.50,
    reputation: 0.30,
    difficultyCompatibility: 0.20,
};
RecommendationEngine.DIFFICULTY_WEIGHTS = {
    BEGINNER: 1,
    INTERMEDIATE: 2,
    ADVANCED: 3,
    EXPERT: 4,
};
exports.RecommendationEngine = RecommendationEngine = RecommendationEngine_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)(queues_constants_1.QUEUE_NAMES.RECOMMENDATIONS)),
    __metadata("design:paramtypes", [bullmq_2.Queue,
        prisma_service_1.PrismaService])
], RecommendationEngine);
//# sourceMappingURL=recommendation.engine.js.map