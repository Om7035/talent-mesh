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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ReputationEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReputationEngine = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../database/prisma.service");
const queues_constants_1 = require("../../common/constants/queues.constants");
const redlock_1 = __importDefault(require("redlock"));
const ioredis_1 = __importDefault(require("ioredis"));
let ReputationEngine = ReputationEngine_1 = class ReputationEngine {
    constructor(reputationQueue, prisma, configService) {
        this.reputationQueue = reputationQueue;
        this.prisma = prisma;
        this.configService = configService;
        this.logger = new common_1.Logger(ReputationEngine_1.name);
        this.LOCK_TTL_MS = this.configService.get('REPUTATION_LOCK_TTL', 10000);
        this.LOCK_RETRY_COUNT = this.configService.get('REPUTATION_LOCK_RETRY', 3);
        const redis = new ioredis_1.default({
            host: this.configService.get('REDIS_HOST', 'localhost'),
            port: this.configService.get('REDIS_PORT', 6379),
            password: this.configService.get('REDIS_PASSWORD', ''),
        });
        this.redlock = new redlock_1.default([redis], {
            driftFactor: 0.01,
            retryCount: this.LOCK_RETRY_COUNT,
            retryDelay: 200,
            retryJitter: 100,
            automaticExtensionThreshold: 500,
        });
        this.redlock.on('error', (err) => {
            if (!err.message.includes('attempts to lock the resource')) {
                this.logger.error(`Redlock error: ${err.message}`);
            }
        });
    }
    async enqueueRecalculation(studentId, priority = 5) {
        await this.reputationQueue.add(queues_constants_1.JOB_NAMES.REPUTATION.RECALCULATE, { studentId }, {
            priority,
            jobId: `reputation:${studentId}`,
            removeOnComplete: true,
            removeOnFail: false,
        });
        this.logger.debug(`Enqueued reputation recalculation for student: ${studentId}`);
    }
    async recalculate(studentId) {
        const lockKey = `lock:reputation:${studentId}`;
        let lock;
        try {
            lock = await this.redlock.acquire([lockKey], this.LOCK_TTL_MS);
            this.logger.debug(`Acquired reputation lock for student: ${studentId}`);
        }
        catch (err) {
            this.logger.warn(`Could not acquire reputation lock for ${studentId} — skipping`);
            return;
        }
        try {
            const score = await this.computeScore(studentId);
            await this.prisma.student.update({
                where: { id: studentId },
                data: {
                    reputationScore: score.total,
                    completionRate: score.completionRate,
                    avgClientRating: score.avgRating,
                    onTimeDeliveryRate: score.onTimeRate,
                },
            });
            this.logger.log(`Reputation updated for ${studentId}: ${score.total.toFixed(2)} ` +
                `[completion:${(score.completionRate * 100).toFixed(0)}% | ` +
                `rating:${score.avgRating.toFixed(2)} | ` +
                `onTime:${(score.onTimeRate * 100).toFixed(0)}%]`);
            await this.reputationQueue.add(queues_constants_1.JOB_NAMES.LEADERBOARD.REBUILD_COLLEGE, { studentId }, { delay: 2000 });
        }
        finally {
            await lock.release();
            this.logger.debug(`Released reputation lock for student: ${studentId}`);
        }
    }
    async computeScore(studentId) {
        const contracts = await this.prisma.contract.findMany({
            where: { studentId },
            include: {
                project: { select: { difficulty: true } },
                reviews: { where: { revieweeId: { not: undefined } } },
            },
        });
        const totalContracts = contracts.length;
        const completedContracts = contracts.filter((c) => c.status === 'COMPLETED' || c.status === 'RELEASED');
        const completionRate = totalContracts > 0 ? completedContracts.length / totalContracts : 0;
        const reviews = await this.prisma.review.findMany({
            where: { revieweeId: studentId },
            select: { rating: true },
        });
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;
        const normalizedRating = avgRating / 5.0;
        const avgDifficulty = completedContracts.length > 0
            ? completedContracts.reduce((sum, c) => {
                const score = ReputationEngine_1.DIFFICULTY_SCORES[c.project.difficulty] ?? 0.25;
                return sum + score;
            }, 0) / completedContracts.length
            : 0;
        const deliveredContracts = completedContracts.filter((c) => c.wasOnTime !== null);
        const onTimeRate = deliveredContracts.length > 0
            ? deliveredContracts.filter((c) => c.wasOnTime === true).length / deliveredContracts.length
            : 0.5;
        const student = await this.prisma.student.findUnique({
            where: { id: studentId },
            include: {
                skills: { select: { endorsed: true } },
            },
        });
        const skillCount = student?.skills.length ?? 0;
        const endorsedSkills = student?.skills.filter((s) => s.endorsed > 0).length ?? 0;
        const skillsBonus = skillCount > 0 ? Math.min(endorsedSkills / skillCount, 1.0) : 0;
        const rawScore = (ReputationEngine_1.WEIGHTS.completionRate * completionRate) +
            (ReputationEngine_1.WEIGHTS.clientRating * normalizedRating) +
            (ReputationEngine_1.WEIGHTS.projectDifficulty * avgDifficulty) +
            (ReputationEngine_1.WEIGHTS.onTimeDelivery * onTimeRate) +
            (ReputationEngine_1.WEIGHTS.verifiedSkills * skillsBonus);
        const total = Math.min(Math.round(rawScore * 100 * 100) / 100, 100);
        return {
            total,
            completionRate,
            avgRating,
            onTimeRate,
            difficultyBonus: avgDifficulty,
            skillsBonus,
        };
    }
};
exports.ReputationEngine = ReputationEngine;
ReputationEngine.WEIGHTS = {
    completionRate: 0.40,
    clientRating: 0.25,
    projectDifficulty: 0.15,
    onTimeDelivery: 0.10,
    verifiedSkills: 0.10,
};
ReputationEngine.DIFFICULTY_SCORES = {
    BEGINNER: 0.25,
    INTERMEDIATE: 0.50,
    ADVANCED: 0.75,
    EXPERT: 1.00,
};
exports.ReputationEngine = ReputationEngine = ReputationEngine_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)(queues_constants_1.QUEUE_NAMES.REPUTATION)),
    __metadata("design:paramtypes", [bullmq_2.Queue,
        prisma_service_1.PrismaService,
        config_1.ConfigService])
], ReputationEngine);
//# sourceMappingURL=reputation.engine.js.map