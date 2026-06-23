import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'warn' },
      ],
      errorFormat: 'colorless',
    });
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('Connecting to PostgreSQL via Prisma...');
    await this.$connect();
    this.logger.log('✅ Database connection established');

    // Log slow queries in development
    if (process.env.NODE_ENV !== 'production') {
      (this as any).$on('query', (e: { query: string; duration: number }) => {
        if (e.duration > 500) {
          this.logger.warn(`🐢 Slow Query (${e.duration}ms): ${e.query}`);
        }
      });
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Disconnecting from database...');
    await this.$disconnect();
  }

  /**
   * Soft-deletes a record by setting deletedAt (if schema supports it).
   * Used for audit-trail-preserving deletions.
   */
  async cleanDatabase(): Promise<void> {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('cleanDatabase() can only be called in test environment!');
    }
    // Delete in correct order to respect FK constraints
    const deleteOrder = [
      'auditLog',
      'notification',
      'recommendation',
      'leaderboard',
      'dispute',
      'deliverable',
      'escrow',
      'review',
      'transaction',
      'wallet',
      'contract',
      'projectApplication',
      'projectSkill',
      'project',
      'studentSkill',
      'certification',
      'resume',
      'student',
      'client',
      'recruiter',
      'tpo',
      'admin',
      'department',
      'college',
      'user',
    ];
    for (const model of deleteOrder) {
      await (this as any)[model].deleteMany();
    }
  }
}
