import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES, JOB_NAMES } from '../../common/constants/queues.constants';
import { RecommendationEngine } from './recommendation.engine';

/**
 * RecommendationsWorker — BullMQ Worker that processes async recommendation
 * generation jobs queued by RecommendationEngine.enqueueForStudent/enqueueForProject.
 */
@Processor(QUEUE_NAMES.RECOMMENDATIONS)
export class RecommendationsWorker extends WorkerHost {
  private readonly logger = new Logger(RecommendationsWorker.name);

  constructor(private readonly recommendationEngine: RecommendationEngine) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case JOB_NAMES.RECOMMENDATIONS.GENERATE_FOR_STUDENT:
        await this.recommendationEngine.generateForStudent(job.data.studentId);
        break;
      case JOB_NAMES.RECOMMENDATIONS.GENERATE_FOR_PROJECT:
        await this.recommendationEngine.generateForProject(job.data.projectId);
        break;
      default:
        this.logger.warn(`Unknown recommendations job: ${job.name}`);
    }
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
