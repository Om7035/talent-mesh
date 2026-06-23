import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ReputationEngine } from './reputation.engine';
export declare class ReputationWorker extends WorkerHost {
    private readonly reputationEngine;
    private readonly logger;
    constructor(reputationEngine: ReputationEngine);
    process(job: Job): Promise<void>;
    private handleRecalculation;
    onCompleted(job: Job): void;
    onFailed(job: Job, error: Error): void;
}
