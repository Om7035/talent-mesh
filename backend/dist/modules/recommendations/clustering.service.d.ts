import { PrismaService } from '../../database/prisma.service';
import { RecommendationEngine } from './recommendation.engine';
export declare class ClusteringService {
    private readonly prisma;
    private readonly recommendationEngine;
    private readonly logger;
    constructor(prisma: PrismaService, recommendationEngine: RecommendationEngine);
    recalculateClusters(): Promise<{
        success: boolean;
        message: string;
        totalClustered?: undefined;
        tiersChanged?: undefined;
        distribution?: undefined;
    } | {
        success: boolean;
        totalClustered: number;
        tiersChanged: number;
        distribution: {
            totalBeginners: number;
            totalRisingTalents: number;
            totalProfessionals: number;
            totalElites: number;
        };
        message?: undefined;
    }>;
    private updateSystemMetrics;
    normalize(data: number[][]): number[][];
}
