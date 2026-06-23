import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ClusterTier } from '@prisma/client';
import { RecommendationEngine } from './recommendation.engine';

@Injectable()
export class ClusteringService {
  private readonly logger = new Logger(ClusteringService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly recommendationEngine: RecommendationEngine,
  ) {}

  /**
   * Recalculates ML clusters for all active students, updates the system metrics,
   * and regenerates the recommendation scores exclusively for students whose tier changed.
   */
  async recalculateClusters() {
    this.logger.log('Starting Manual K-Means student clustering pipeline...');

    try {
      const students = await this.prisma.student.findMany({
        where: { isActive: true },
        select: {
          id: true,
          clusterTier: true,
          completionRate: true,
          onTimeDeliveryRate: true,
          totalEarnings: true,
          projectsCompleted: true,
          avgClientRating: true,
          reputationScore: true,
        },
      });

      if (students.length < 4) {
        this.logger.warn('Not enough students to run K-Means clustering (K=4 requires at least 4 students).');
        return { success: false, message: 'Not enough active students.' };
      }

      // 1. Feature extraction & Min-Max Normalization
      const features = students.map((s) => [
        s.completionRate,
        s.onTimeDeliveryRate,
        Number(s.totalEarnings),
        s.projectsCompleted,
        s.avgClientRating,
        s.reputationScore,
      ]);

      const normalizedData = this.normalize(features);

      // 2. Run K-Means with K=4
      // Use dynamic import to prevent Jest ESM syntax errors
      // @ts-ignore
      const { kmeans } = await import('ml-kmeans');
      const result = kmeans(normalizedData, 4, { initialization: 'kmeans++' });
      
      // 3. Map the 4 clusters to BEGINNER, RISING_TALENT, PROFESSIONAL, ELITE
      const centroidScores = result.centroids.map((centroid, index) => ({
        index,
        score: centroid.reduce((a, b) => a + b, 0),
      }));

      centroidScores.sort((a, b) => a.score - b.score);

      const clusterMap: Record<number, ClusterTier> = {
        [centroidScores[0].index]: ClusterTier.BEGINNER,
        [centroidScores[1].index]: ClusterTier.RISING_TALENT,
        [centroidScores[2].index]: ClusterTier.PROFESSIONAL,
        [centroidScores[3].index]: ClusterTier.ELITE,
      };

      // 4. Batch Update DB and Collect Statistics
      let updatedCount = 0;
      let totalBeginners = 0;
      let totalRisingTalents = 0;
      let totalProfessionals = 0;
      let totalElites = 0;

      const studentsRequiringRegeneration: string[] = [];

      for (let i = 0; i < students.length; i++) {
        const studentId = students[i].id;
        const oldTier = students[i].clusterTier;
        const assignedClusterIndex = result.clusters[i];
        const newTier = clusterMap[assignedClusterIndex];

        // Track distribution stats
        if (newTier === ClusterTier.BEGINNER) totalBeginners++;
        else if (newTier === ClusterTier.RISING_TALENT) totalRisingTalents++;
        else if (newTier === ClusterTier.PROFESSIONAL) totalProfessionals++;
        else if (newTier === ClusterTier.ELITE) totalElites++;

        // Only update database and trigger regeneration if the tier actually changed
        if (oldTier !== newTier) {
          await this.prisma.student.update({
            where: { id: studentId },
            data: { clusterTier: newTier },
          });
          
          studentsRequiringRegeneration.push(studentId);
          updatedCount++;
        }
      }

      // 5. Update SystemMetrics
      await this.updateSystemMetrics({
        totalBeginners,
        totalRisingTalents,
        totalProfessionals,
        totalElites,
      });

      // 6. Enqueue Recommendation Regeneration for affected students
      for (const studentId of studentsRequiringRegeneration) {
        await this.recommendationEngine.enqueueForStudent(studentId);
      }

      this.logger.log(`K-Means pipeline finished. Clustered ${students.length} total students. ${updatedCount} students changed tiers and were queued for regeneration.`);
      
      return {
        success: true,
        totalClustered: students.length,
        tiersChanged: updatedCount,
        distribution: {
          totalBeginners,
          totalRisingTalents,
          totalProfessionals,
          totalElites,
        }
      };

    } catch (error) {
      this.logger.error('Failed to execute K-Means clustering', error);
      throw error;
    }
  }

  private async updateSystemMetrics(stats: any) {
    const existing = await this.prisma.systemMetrics.findFirst();
    if (existing) {
      await this.prisma.systemMetrics.update({
        where: { id: existing.id },
        data: {
          lastClusterRunAt: new Date(),
          ...stats,
        },
      });
    } else {
      await this.prisma.systemMetrics.create({
        data: {
          lastClusterRunAt: new Date(),
          ...stats,
        },
      });
    }
  }

  /**
   * Min-Max Normalization for a 2D array
   */
  public normalize(data: number[][]): number[][] {
    if (data.length === 0) return data;
    const cols = data[0].length;
    const mins = new Array(cols).fill(Infinity);
    const maxs = new Array(cols).fill(-Infinity);

    for (const row of data) {
      for (let j = 0; j < cols; j++) {
        if (row[j] < mins[j]) mins[j] = row[j];
        if (row[j] > maxs[j]) maxs[j] = row[j];
      }
    }

    return data.map((row) =>
      row.map((val, j) => {
        const range = maxs[j] - mins[j];
        return range === 0 ? 0 : (val - mins[j]) / range;
      }),
    );
  }
}
