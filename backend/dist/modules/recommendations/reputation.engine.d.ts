import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
export declare class ReputationEngine {
    private readonly reputationQueue;
    private readonly prisma;
    private readonly configService;
    private readonly logger;
    private readonly redlock;
    private readonly LOCK_TTL_MS;
    private readonly LOCK_RETRY_COUNT;
    private static readonly WEIGHTS;
    private static readonly DIFFICULTY_SCORES;
    constructor(reputationQueue: Queue, prisma: PrismaService, configService: ConfigService);
    enqueueRecalculation(studentId: string, priority?: number): Promise<void>;
    recalculate(studentId: string): Promise<void>;
    private computeScore;
}
