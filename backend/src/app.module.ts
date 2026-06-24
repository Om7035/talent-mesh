import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bullmq';
import { DatabaseModule } from './database/database.module';
import { ActivityModule } from './modules/activity/activity.module';
import { UploadModule } from './modules/upload/upload.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StudentsModule } from './modules/students/students.module';
import { ClientsModule } from './modules/clients/clients.module';
import { RecruitersModule } from './modules/recruiters/recruiters.module';
import { TpoModule } from './modules/tpo/tpo.module';
import { AdminModule } from './modules/admin/admin.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { SkillsModule } from './modules/skills/skills.module';
import { CollegesModule } from './modules/colleges/colleges.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DisputesModule } from './modules/disputes/disputes.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { PartnershipsModule } from './modules/partnerships/partnerships.module';
import { configValidationSchema } from './config/config.validation';

@Module({
  imports: [
    // ─────────────────────────────────────────
    // Configuration
    // ─────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../.env', '.env'],
      validationSchema: configValidationSchema,
      cache: true,
    }),

    // ─────────────────────────────────────────
    // Rate Limiting (Throttler)
    // ─────────────────────────────────────────
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => [
        {
          ttl: cfg.get<number>('THROTTLE_TTL', 60000),
          limit: cfg.get<number>('THROTTLE_LIMIT', 100),
        },
      ],
    }),

    // ─────────────────────────────────────────
    // BullMQ (Redis-backed Job Queues)
    // ─────────────────────────────────────────
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        connection: {
          host: cfg.get<string>('REDIS_HOST', 'localhost'),
          port: cfg.get<number>('REDIS_PORT', 6379),
          password: cfg.get<string>('REDIS_PASSWORD', ''),
          ...(cfg.get<boolean>('REDIS_TLS', false) ? { tls: {} } : {}),
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
        },
      }),
    }),

    // ─────────────────────────────────────────
    // Core Modules
    // ─────────────────────────────────────────
    DatabaseModule,

    // ─────────────────────────────────────────
    // Global Utility Modules
    // ─────────────────────────────────────────
    ActivityModule,
    UploadModule,

    // ─────────────────────────────────────────
    // Feature Modules
    // ─────────────────────────────────────────
    AuthModule,
    UsersModule,
    StudentsModule,
    ClientsModule,
    RecruitersModule,
    TpoModule,
    AdminModule,
    ProjectsModule,
    ApplicationsModule,
    ContractsModule,
    WalletModule,
    ReviewsModule,
    SkillsModule,
    CollegesModule,
    RecommendationsModule,
    LeaderboardModule,
    AnalyticsModule,
    NotificationsModule,
    DisputesModule,
    MessagingModule,
    PartnershipsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
