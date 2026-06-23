"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ClusteringService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClusteringService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
const recommendation_engine_1 = require("./recommendation.engine");
let ClusteringService = ClusteringService_1 = class ClusteringService {
    constructor(prisma, recommendationEngine) {
        this.prisma = prisma;
        this.recommendationEngine = recommendationEngine;
        this.logger = new common_1.Logger(ClusteringService_1.name);
    }
    async recalculateClusters() {
        this.logger.log('Starting Manual K-Means student clustering pipeline...');
        try {
            const students = await this.prisma.student.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    clusterTier: true,
                    completionRate: true,
                    onTimeDeliveryRate: true,
                    totalEarnings: true,
                    projectsCompleted: true,
                    avgClientRating: true,
                    reputationScore: true,
                },
            });
            if (students.length < 4) {
                this.logger.warn('Not enough students to run K-Means clustering (K=4 requires at least 4 students).');
                return { success: false, message: 'Not enough active students.' };
            }
            const features = students.map((s) => [
                s.completionRate,
                s.onTimeDeliveryRate,
                Number(s.totalEarnings),
                s.projectsCompleted,
                s.avgClientRating,
                s.reputationScore,
            ]);
            const normalizedData = this.normalize(features);
            const { kmeans } = await Promise.resolve().then(() => __importStar(require('ml-kmeans')));
            const result = kmeans(normalizedData, 4, { initialization: 'kmeans++' });
            const centroidScores = result.centroids.map((centroid, index) => ({
                index,
                score: centroid.reduce((a, b) => a + b, 0),
            }));
            centroidScores.sort((a, b) => a.score - b.score);
            const clusterMap = {
                [centroidScores[0].index]: client_1.ClusterTier.BEGINNER,
                [centroidScores[1].index]: client_1.ClusterTier.RISING_TALENT,
                [centroidScores[2].index]: client_1.ClusterTier.PROFESSIONAL,
                [centroidScores[3].index]: client_1.ClusterTier.ELITE,
            };
            let updatedCount = 0;
            let totalBeginners = 0;
            let totalRisingTalents = 0;
            let totalProfessionals = 0;
            let totalElites = 0;
            const studentsRequiringRegeneration = [];
            for (let i = 0; i < students.length; i++) {
                const studentId = students[i].id;
                const oldTier = students[i].clusterTier;
                const assignedClusterIndex = result.clusters[i];
                const newTier = clusterMap[assignedClusterIndex];
                if (newTier === client_1.ClusterTier.BEGINNER)
                    totalBeginners++;
                else if (newTier === client_1.ClusterTier.RISING_TALENT)
                    totalRisingTalents++;
                else if (newTier === client_1.ClusterTier.PROFESSIONAL)
                    totalProfessionals++;
                else if (newTier === client_1.ClusterTier.ELITE)
                    totalElites++;
                if (oldTier !== newTier) {
                    await this.prisma.student.update({
                        where: { id: studentId },
                        data: { clusterTier: newTier },
                    });
                    studentsRequiringRegeneration.push(studentId);
                    updatedCount++;
                }
            }
            await this.updateSystemMetrics({
                totalBeginners,
                totalRisingTalents,
                totalProfessionals,
                totalElites,
            });
            for (const studentId of studentsRequiringRegeneration) {
                await this.recommendationEngine.enqueueForStudent(studentId);
            }
            this.logger.log(`K-Means pipeline finished. Clustered ${students.length} total students. ${updatedCount} students changed tiers and were queued for regeneration.`);
            return {
                success: true,
                totalClustered: students.length,
                tiersChanged: updatedCount,
                distribution: {
                    totalBeginners,
                    totalRisingTalents,
                    totalProfessionals,
                    totalElites,
                }
            };
        }
        catch (error) {
            this.logger.error('Failed to execute K-Means clustering', error);
            throw error;
        }
    }
    async updateSystemMetrics(stats) {
        const existing = await this.prisma.systemMetrics.findFirst();
        if (existing) {
            await this.prisma.systemMetrics.update({
                where: { id: existing.id },
                data: {
                    lastClusterRunAt: new Date(),
                    ...stats,
                },
            });
        }
        else {
            await this.prisma.systemMetrics.create({
                data: {
                    lastClusterRunAt: new Date(),
                    ...stats,
                },
            });
        }
    }
    normalize(data) {
        if (data.length === 0)
            return data;
        const cols = data[0].length;
        const mins = new Array(cols).fill(Infinity);
        const maxs = new Array(cols).fill(-Infinity);
        for (const row of data) {
            for (let j = 0; j < cols; j++) {
                if (row[j] < mins[j])
                    mins[j] = row[j];
                if (row[j] > maxs[j])
                    maxs[j] = row[j];
            }
        }
        return data.map((row) => row.map((val, j) => {
            const range = maxs[j] - mins[j];
            return range === 0 ? 0 : (val - mins[j]) / range;
        }));
    }
};
exports.ClusteringService = ClusteringService;
exports.ClusteringService = ClusteringService = ClusteringService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        recommendation_engine_1.RecommendationEngine])
], ClusteringService);
//# sourceMappingURL=clustering.service.js.map