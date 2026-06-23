import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES, JOB_NAMES } from '../../common/constants/queues.constants';
import { ReputationEngine } from './reputation.engine';

/**
 * ReputationWorker — BullMQ Worker that processes async reputation recalculation jobs.
 *
 * Architectural Notes:
 *   - Runs in the same NestJS process but asynchronously (non-blocking to HTTP requests)
 *   - In production, can be split to a separate worker process/pod for horizontal scaling
 *   - Job deduplication via jobId: `reputation:{studentId}` prevents redundant recalculations
 *   - Exponential backoff retry on failure (3 attempts, 1s/2s/4s delays)
 */
@Processor(QUEUE_NAMES.REPUTATION)
export class ReputationWorker extends WorkerHost {
  private readonly logger = new Logger(ReputationWorker.name);

  constructor(private readonly reputationEngine: ReputationEngine) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case JOB_NAMES.REPUTATION.RECALCULATE:
        await this.handleRecalculation(job);
        break;
      default:
        this.logger.warn(`Unknown reputation job: ${job.name}`);
    }
  }

  private async handleRecalculation(job: Job<{ studentId: string }>): Promise<void> {
    const { studentId } = job.data;
    this.logger.debug(`Processing reputation recalculation for student: ${studentId}`);
    await this.reputationEngine.recalculate(studentId);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job): void {
    this.logger.debug(`Job ${job.id} (${job.name}) completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error): void {
    this.logger.error(`Job ${job.id} (${job.name}) failed: ${error.message}`);
  }
}
