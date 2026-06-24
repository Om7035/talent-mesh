import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_NAMES } from '../../common/constants/queues.constants';
import { ReputationEngine } from './reputation.engine';
import { ReputationWorker } from './reputation.worker';
import { RecommendationEngine } from './recommendation.engine';
import { RecommendationsWorker } from './recommendations.worker';
import { ClusteringService } from './clustering.service';
import { RecommendationsController } from './recommendations.controller';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QUEUE_NAMES.REPUTATION },
      { name: QUEUE_NAMES.RECOMMENDATIONS },
    ),
    LeaderboardModule,
  ],
  providers: [
    ReputationEngine,
    ReputationWorker,
    RecommendationEngine,
    RecommendationsWorker,
    ClusteringService,
  ],
  controllers: [RecommendationsController],
  exports: [ReputationEngine, RecommendationEngine, ClusteringService],
})
export class RecommendationsModule {}
