import { Test, TestingModule } from '@nestjs/testing';
import { ClusteringService } from './clustering.service';
import { RecommendationEngine } from './recommendation.engine';
import { PrismaService } from '../../database/prisma.service';
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

describe('ML Regeneration Pipeline Integration', () => {
  let clusteringService: ClusteringService;
  let recommendationEngine: RecommendationEngine;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClusteringService,
        {
          provide: RecommendationEngine,
          useValue: {
            enqueueForStudent: jest.fn(),
          },
        },
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
      ],
    }).compile();

    clusteringService = module.get<ClusteringService>(ClusteringService);
    recommendationEngine = module.get<RecommendationEngine>(RecommendationEngine);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('End-to-End: Clustering Run -> Tier Change -> Recommendation Regeneration', async () => {
    // 1. Setup mock students. We have 4 students to ensure K-Means runs.
    const mockStudents = [
      { id: 'student-a', clusterTier: ClusterTier.BEGINNER, completionRate: 0.1, onTimeDeliveryRate: 0.1, totalEarnings: 10, projectsCompleted: 1, avgClientRating: 1, reputationScore: 10 },
      { id: 'student-b', clusterTier: ClusterTier.RISING_TALENT, completionRate: 0.5, onTimeDeliveryRate: 0.5, totalEarnings: 500, projectsCompleted: 5, avgClientRating: 3, reputationScore: 50 },
      { id: 'student-c', clusterTier: ClusterTier.PROFESSIONAL, completionRate: 0.8, onTimeDeliveryRate: 0.8, totalEarnings: 2000, projectsCompleted: 15, avgClientRating: 4.5, reputationScore: 85 },
      // Student D currently holds 'BEGINNER' but has Elite stats!
      { id: 'student-d', clusterTier: ClusterTier.BEGINNER, completionRate: 1.0, onTimeDeliveryRate: 1.0, totalEarnings: 10000, projectsCompleted: 50, avgClientRating: 5.0, reputationScore: 100 },
    ];

    (prisma.student.findMany as jest.Mock).mockResolvedValue(mockStudents);
    (prisma.systemMetrics.findFirst as jest.Mock).mockResolvedValue(null);

    // 2. Trigger the clustering run
    const result = await clusteringService.recalculateClusters();

    expect(result.success).toBe(true);

    // 3. Verify that student-d's tier changed in the DB from BEGINNER to ELITE
    expect(prisma.student.update).toHaveBeenCalledWith({
      where: { id: 'student-d' },
      data: { clusterTier: ClusterTier.ELITE },
    });

    // 4. Verify that ONLY student-d had their recommendations regenerated
    // (Because A, B, and C stayed in their mathematically identical tiers)
    expect(recommendationEngine.enqueueForStudent).toHaveBeenCalledTimes(1);
    expect(recommendationEngine.enqueueForStudent).toHaveBeenCalledWith('student-d');
  });
});
