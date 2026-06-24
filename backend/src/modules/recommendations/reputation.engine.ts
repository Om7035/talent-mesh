import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { QUEUE_NAMES, JOB_NAMES } from '../../common/constants/queues.constants';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import Redlock from 'redlock';
import Redis from 'ioredis';

/**
 * ReputationEngine — Core scoring algorithm for student reputation.
 *
 * Design decisions:
 *   1. Calculations are triggered asynchronously via BullMQ to avoid blocking HTTP responses.
 *   2. Redlock (distributed mutex algorithm) prevents concurrent recalculations for the same
 *      student across multiple server instances — similar to mutual exclusion (mutex) in OS.
 *   3. The Redlock algorithm uses Redis to acquire a distributed lock on the student's key,
 *      ensuring only one process computes the reputation at a time (race-condition safety).
 *
 * Reputation Formula:
 *   Score = (0.40 × completionRate)
 *         + (0.25 × normalizedClientRating)
 *         + (0.15 × difficultyBonus)
 *         + (0.10 × onTimeDeliveryRate)
 *         + (0.10 × verifiedSkillsBonus)
 *
 * Output: 0–100 float
 */
@Injectable()
export class ReputationEngine {
  private readonly logger = new Logger(ReputationEngine.name);
  private readonly redlock: Redlock;
  private readonly LOCK_TTL_MS: number;
  private readonly LOCK_RETRY_COUNT: number;

  // Weights must sum to 1.0
  private static readonly WEIGHTS = {
    completionRate: 0.40,
    clientRating: 0.25,
    projectDifficulty: 0.15,
    onTimeDelivery: 0.10,
    verifiedSkills: 0.10,
  };

  private static readonly DIFFICULTY_SCORES: Record<string, number> = {
    BEGINNER: 0.25,
    INTERMEDIATE: 0.50,
    ADVANCED: 0.75,
    EXPERT: 1.00,
  };

  constructor(
    @InjectQueue(QUEUE_NAMES.REPUTATION) private readonly reputationQueue: Queue,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly leaderboardService: LeaderboardService,
  ) {
    this.LOCK_TTL_MS = this.configService.get<number>('REPUTATION_LOCK_TTL', 10000);
    this.LOCK_RETRY_COUNT = this.configService.get<number>('REPUTATION_LOCK_RETRY', 3);

    // Initialize Redlock with Redis connection for distributed mutex
    const redis = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD', ''),
      ...(this.configService.get<boolean>('REDIS_TLS', false) ? { tls: {} } : {}),
    });

    this.redlock = new Redlock([redis], {
      driftFactor: 0.01,
      retryCount: this.LOCK_RETRY_COUNT,
      retryDelay: 200,   // ms between retries
      retryJitter: 100,  // adds random jitter to avoid thundering herd
      automaticExtensionThreshold: 500,
    });

    this.redlock.on('error', (err) => {
      // Only log actual errors, not lock misses
      if (!err.message.includes('attempts to lock the resource')) {
        this.logger.error(`Redlock error: ${err.message}`);
      }
    });
  }

  /**
   * Enqueues an async reputation recalculation job via BullMQ.
   * Called after contract completion, review received, or skill verification.
   * Non-blocking — returns immediately.
   */
  async enqueueRecalculation(studentId: string, priority: number = 5): Promise<void> {
    await this.reputationQueue.add(
      JOB_NAMES.REPUTATION.RECALCULATE,
      { studentId },
      { 
        priority,
        jobId: `reputation:${studentId}`, // Deduplication: only one pending job per student
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
    this.logger.debug(`Enqueued reputation recalculation for student: ${studentId}`);
  }

  /**
   * Core calculation logic — must be called from the BullMQ worker only.
   *
   * Uses Redlock distributed mutex to ensure only one calculation runs
   * per student at a time across all server instances (mutual exclusion).
   *
   * Flow:
   *   1. Acquire distributed lock on `lock:reputation:{studentId}`
   *   2. Read all completed contracts, reviews, skills for student
   *   3. Apply weighted formula
   *   4. Atomically update student record
   *   5. Trigger leaderboard re-ranking
   *   6. Release lock
   */
  async recalculate(studentId: string): Promise<void> {
    const lockKey = `lock:reputation:${studentId}`;

    let lock;
    try {
      // Acquire distributed lock — mutual exclusion across all instances
      lock = await this.redlock.acquire([lockKey], this.LOCK_TTL_MS);
      this.logger.debug(`Acquired reputation lock for student: ${studentId}`);
    } catch (err) {
      // Another worker is already calculating — skip (idempotent)
      this.logger.warn(`Could not acquire reputation lock for ${studentId} — skipping`);
      return;
    }

    try {
      const score = await this.computeScore(studentId);

      // Atomic update of all reputation-related fields
      await this.prisma.student.update({
        where: { id: studentId },
        data: {
          reputationScore: score.total,
          completionRate: score.completionRate,
          avgClientRating: score.avgRating,
          onTimeDeliveryRate: score.onTimeRate,
        },
      });

      this.logger.log(
        `Reputation updated for ${studentId}: ${score.total.toFixed(2)} ` +
        `[completion:${(score.completionRate * 100).toFixed(0)}% | ` +
        `rating:${score.avgRating.toFixed(2)} | ` +
        `onTime:${(score.onTimeRate * 100).toFixed(0)}%]`,
      );

      // Rebuild leaderboard rankings so this student's new score is reflected immediately.
      // (Previously this enqueued a job under a job name no worker ever processed — dead code
      // that silently never ran. Calling the rebuild directly is simpler and actually works.)
      try {
        await this.leaderboardService.rebuildGlobalRankings();
      } catch (err) {
        this.logger.error(`Leaderboard rebuild failed after reputation update for ${studentId}: ${err}`);
      }

    } finally {
      // Always release lock — even if computation fails
      await lock.release();
      this.logger.debug(`Released reputation lock for student: ${studentId}`);
    }
  }

  /**
   * Computes the raw score components from the database.
   * This is a pure function — reads data, applies weights, returns breakdown.
   */
  private async computeScore(studentId: string): Promise<{
    total: number;
    completionRate: number;
    avgRating: number;
    onTimeRate: number;
    difficultyBonus: number;
    skillsBonus: number;
  }> {
    // Fetch all contracts for the student
    const contracts = await this.prisma.contract.findMany({
      where: { studentId },
      include: {
        project: { select: { difficulty: true } },
        reviews: { where: { revieweeId: { not: undefined } } },
      },
    });

    const totalContracts = contracts.length;
    const completedContracts = contracts.filter(
      (c) => c.status === 'COMPLETED' || c.status === 'RELEASED',
    );

    // ── Component 1: Completion Rate (40%) ──
    const completionRate =
      totalContracts > 0 ? completedContracts.length / totalContracts : 0;

    // ── Component 2: Average Client Rating (25%) ──
    const reviews = await this.prisma.review.findMany({
      where: { revieweeId: studentId },
      select: { rating: true },
    });
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
    const normalizedRating = avgRating / 5.0; // Normalize to 0-1

    // ── Component 3: Project Difficulty Bonus (15%) ──
    const avgDifficulty =
      completedContracts.length > 0
        ? completedContracts.reduce((sum, c) => {
            const score = ReputationEngine.DIFFICULTY_SCORES[c.project.difficulty] ?? 0.25;
            return sum + score;
          }, 0) / completedContracts.length
        : 0;

    // ── Component 4: On-Time Delivery Rate (10%) ──
    const deliveredContracts = completedContracts.filter((c) => c.wasOnTime !== null);
    const onTimeRate =
      deliveredContracts.length > 0
        ? deliveredContracts.filter((c) => c.wasOnTime === true).length / deliveredContracts.length
        : 0.5; // Default to 50% if no data

    // ── Component 5: Verified Skills Bonus (10%) ──
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        skills: { select: { endorsed: true } },
      },
    });
    const skillCount = student?.skills.length ?? 0;
    const endorsedSkills = student?.skills.filter((s) => s.endorsed > 0).length ?? 0;
    const skillsBonus = skillCount > 0 ? Math.min(endorsedSkills / skillCount, 1.0) : 0;

    // ── Apply Weights to get Total Score (0–100) ──
    const rawScore =
      (ReputationEngine.WEIGHTS.completionRate * completionRate) +
      (ReputationEngine.WEIGHTS.clientRating * normalizedRating) +
      (ReputationEngine.WEIGHTS.projectDifficulty * avgDifficulty) +
      (ReputationEngine.WEIGHTS.onTimeDelivery * onTimeRate) +
      (ReputationEngine.WEIGHTS.verifiedSkills * skillsBonus);

    const total = Math.min(Math.round(rawScore * 100 * 100) / 100, 100); // Cap at 100, 2 decimal places

    return {
      total,
      completionRate,
      avgRating,
      onTimeRate,
      difficultyBonus: avgDifficulty,
      skillsBonus,
    };
  }
}
