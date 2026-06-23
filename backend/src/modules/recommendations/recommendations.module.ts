import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_NAMES } from '../../common/constants/queues.constants';
import { ReputationEngine } from './reputation.engine';
import { ReputationWorker } from './reputation.worker';
import { RecommendationEngine } from './recommendation.engine';
import { ClusteringService } from './clustering.service';
import { RecommendationsController } from './recommendations.controller';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QUEUE_NAMES.REPUTATION },
      { name: QUEUE_NAMES.RECOMMENDATIONS },
    ),
  ],
  providers: [
    ReputationEngine,
    ReputationWorker,
    RecommendationEngine,
    ClusteringService,
  ],
  controllers: [RecommendationsController],
  exports: [ReputationEngine, RecommendationEngine, ClusteringService],
})
export class RecommendationsModule {}
