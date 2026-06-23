import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationEngine } from './recommendation.engine';
import { PrismaService } from '../../database/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';
import { QUEUE_NAMES } from '../../common/constants/queues.constants';
import { ClusterTier } from '@prisma/client';

describe('RecommendationEngine', () => {
  let engine: RecommendationEngine;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationEngine,
        {
          provide: PrismaService,
          useValue: {
            student: { findUnique: jest.fn() },
            project: { findMany: jest.fn() },
            recommendation: { upsert: jest.fn(), findMany: jest.fn() },
          },
        },
        {
          provide: getQueueToken(QUEUE_NAMES.RECOMMENDATIONS),
          useValue: { add: jest.fn() },
        },
      ],
    }).compile();

    engine = module.get<RecommendationEngine>(RecommendationEngine);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('generateForStudent', () => {
    it('applies higher bonus to ELITE tier compared to BEGINNER tier', async () => {
      // Mock common project
      const mockProjects = [
        {
          id: 'proj-1',
          difficulty: 'INTERMEDIATE',
          skills: [{ skillId: 'skill-1' }],
        },
      ];

      (prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects);

      // Mock Elite Student
      const mockEliteStudent = {
        id: 'student-elite',
        clusterTier: ClusterTier.ELITE,
        reputationScore: 50,
        skills: [{ skillId: 'skill-1' }],
        contracts: [],
      };

      // Mock Beginner Student (Identical stats except tier)
      const mockBeginnerStudent = {
        id: 'student-beginner',
        clusterTier: ClusterTier.BEGINNER,
        reputationScore: 50,
        skills: [{ skillId: 'skill-1' }],
        contracts: [],
      };

      // Run for Elite
      (prisma.student.findUnique as jest.Mock).mockResolvedValue(mockEliteStudent);
      await engine.generateForStudent('student-elite');
      
      const eliteUpsertCall = (prisma.recommendation.upsert as jest.Mock).mock.calls[0][0];
      const eliteScore = eliteUpsertCall.create.matchScore;

      // Reset
      (prisma.recommendation.upsert as jest.Mock).mockClear();

      // Run for Beginner
      (prisma.student.findUnique as jest.Mock).mockResolvedValue(mockBeginnerStudent);
      await engine.generateForStudent('student-beginner');

      const beginnerUpsertCall = (prisma.recommendation.upsert as jest.Mock).mock.calls[0][0];
      const beginnerScore = beginnerUpsertCall.create.matchScore;

      // Elite should explicitly be 15 points higher (0.15 multiplier * 100)
      expect(eliteScore).toBeGreaterThan(beginnerScore);
      expect(eliteScore).toBeCloseTo(beginnerScore + 15, 0);
    });
  });
});
