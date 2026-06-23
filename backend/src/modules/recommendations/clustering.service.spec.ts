import { Test, TestingModule } from '@nestjs/testing';
import { ClusteringService } from './clustering.service';
import { PrismaService } from '../../database/prisma.service';
import { RecommendationEngine } from './recommendation.engine';
import { ClusterTier } from '@prisma/client';

jest.mock('ml-kmeans', () => {
  return {
    kmeans: jest.fn().mockImplementation(() => {
      return {
        clusters: [0, 1, 2, 3], // Assign student 0->cluster 0, etc.
        centroids: [[1], [2], [3], [4]] // Centroids ascending so index 0 is BEGINNER, index 3 is ELITE
      };
    })
  };
}, { virtual: true });

describe('ClusteringService', () => {
  let service: ClusteringService;
  let prisma: PrismaService;
  let recommendationEngine: RecommendationEngine;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClusteringService,
        {
          provide: PrismaService,
          useValue: {
            student: {
              findMany: jest.fn(),
              update: jest.fn(),
            },
            systemMetrics: {
              findFirst: jest.fn(),
              update: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: RecommendationEngine,
          useValue: {
            enqueueForStudent: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ClusteringService>(ClusteringService);
    prisma = module.get<PrismaService>(PrismaService);
    recommendationEngine = module.get<RecommendationEngine>(RecommendationEngine);
  });

  describe('normalize', () => {
    it('normalizes features correctly (min-max to 0-1)', () => {
      const data = [
        [0, 100],
        [50, 500],
        [100, 1000],
      ];
      const normalized = service.normalize(data);
      expect(normalized).toEqual([
        [0, 0],
        [0.5, 0.4444444444444444],
        [1, 1],
      ]);
    });

    it('handles empty dataset', () => {
      expect(service.normalize([])).toEqual([]);
    });

    it('handles all students with same values (0 range)', () => {
      const data = [
        [50, 100],
        [50, 100],
      ];
      const normalized = service.normalize(data);
      expect(normalized).toEqual([
        [0, 0],
        [0, 0],
      ]);
    });
  });

  describe('recalculateClusters', () => {
    it('aborts safely if less than 4 active students exist', async () => {
      (prisma.student.findMany as jest.Mock).mockResolvedValue([
        { id: '1' },
        { id: '2' },
        { id: '3' },
      ]);

      const result = await service.recalculateClusters();
      expect(result.success).toBe(false);
      expect(prisma.student.update).not.toHaveBeenCalled();
    });

    it('produces 4 clusters, maps tier bonuses, and enqueues regenerating only changed tiers', async () => {
      // Mock 4 distinct student profiles
      const mockStudents = [
        // Beginner (low everything)
        { id: '1', clusterTier: ClusterTier.PROFESSIONAL, completionRate: 0.1, onTimeDeliveryRate: 0.1, totalEarnings: 10, projectsCompleted: 1, avgClientRating: 1, reputationScore: 10 },
        // Rising Talent (ok stats)
        { id: '2', clusterTier: ClusterTier.RISING_TALENT, completionRate: 0.5, onTimeDeliveryRate: 0.5, totalEarnings: 500, projectsCompleted: 5, avgClientRating: 3, reputationScore: 50 },
        // Professional (good stats)
        { id: '3', clusterTier: ClusterTier.PROFESSIONAL, completionRate: 0.8, onTimeDeliveryRate: 0.8, totalEarnings: 2000, projectsCompleted: 15, avgClientRating: 4.5, reputationScore: 85 },
        // Elite (max stats)
        { id: '4', clusterTier: ClusterTier.ELITE, completionRate: 1.0, onTimeDeliveryRate: 1.0, totalEarnings: 10000, projectsCompleted: 50, avgClientRating: 5.0, reputationScore: 100 },
      ];

      (prisma.student.findMany as jest.Mock).mockResolvedValue(mockStudents);
      (prisma.systemMetrics.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.recalculateClusters();

      expect(result.success).toBe(true);
      expect(result.totalClustered).toBe(4);
      
      // Because we fed them in ascending mathematical strength, the algorithm should map them linearly
      // Student 1 (id: '1') should map to BEGINNER
      // They started as PROFESSIONAL, so they changed tiers.
      expect(prisma.student.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { clusterTier: ClusterTier.BEGINNER },
      });

      // Student 2 started as RISING_TALENT and mathematically belongs in RISING_TALENT.
      // Student 3 started as PROFESSIONAL and belongs in PROFESSIONAL.
      // Student 4 started as ELITE and belongs in ELITE.
      // Therefore, prisma.update and enqueueForStudent should ONLY be called for Student 1.
      expect(prisma.student.update).toHaveBeenCalledTimes(1);
      expect(recommendationEngine.enqueueForStudent).toHaveBeenCalledTimes(1);
      expect(recommendationEngine.enqueueForStudent).toHaveBeenCalledWith('1');

      expect(prisma.systemMetrics.create).toHaveBeenCalled();
    });
  });
});
