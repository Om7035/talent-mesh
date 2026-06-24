import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../database/prisma.service';
import { QUEUE_NAMES, JOB_NAMES } from '../../common/constants/queues.constants';

/**
 * RecommendationEngine — AI-powered project-to-student matching.
 *
 * Algorithm:
 *   matchScore = (0.50 × skillOverlapScore)
 *              + (0.30 × reputationScore)
 *              + (0.20 × difficultyCompatibilityScore)
 *
 * Skill Overlap: Jaccard similarity between project required skills and student skills.
 *   Jaccard(A, B) = |A ∩ B| / |A ∪ B|
 *
 * Reputation: Normalized student reputation score (0–100 → 0–1).
 *
 * Difficulty Compatibility: Matches student average project difficulty to requested level.
 */
@Injectable()
export class RecommendationEngine {
  private readonly logger = new Logger(RecommendationEngine.name);

  private static readonly WEIGHTS = {
    skillOverlap: 0.50,
    reputation: 0.30,
    difficultyCompatibility: 0.20,
  };

  private static readonly DIFFICULTY_WEIGHTS: Record<string, number> = {
    BEGINNER: 1,
    INTERMEDIATE: 2,
    ADVANCED: 3,
    EXPERT: 4,
  };

  constructor(
    @InjectQueue(QUEUE_NAMES.RECOMMENDATIONS) private readonly recommendationsQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Enqueue batch recommendation generation for a new/updated project.
   * Called when a new project is posted or skills are updated.
   */
  async enqueueForProject(projectId: string): Promise<void> {
    await this.recommendationsQueue.add(
      JOB_NAMES.RECOMMENDATIONS.GENERATE_FOR_PROJECT,
      { projectId },
      { jobId: `rec:project:${projectId}`, delay: 5000 },
    );
  }

  /**
   * Enqueue recommendations for a specific student (called after profile update).
   */
  async enqueueForStudent(studentId: string): Promise<void> {
    await this.recommendationsQueue.add(
      JOB_NAMES.RECOMMENDATIONS.GENERATE_FOR_STUDENT,
      { studentId },
      { jobId: `rec:student:${studentId}`, delay: 3000 },
    );
  }

  /**
   * Generate and store top-N project recommendations for a student.
   * Uses Jaccard similarity for skill matching.
   */
  async generateForStudent(studentId: string): Promise<void> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        skills: { include: { skill: true } },
        contracts: {
          where: { status: { in: ['COMPLETED', 'RELEASED'] } },
          include: { project: { select: { difficulty: true } } },
          take: 20,
        },
      },
    });

    if (!student) return;

    const studentSkillIds = new Set(student.skills.map((s) => s.skillId));
    const studentReputationNormalized = student.reputationScore / 100;

    // Calculate student's typical difficulty level
    const completedDifficulties = student.contracts.map(
      (c) => RecommendationEngine.DIFFICULTY_WEIGHTS[c.project.difficulty] ?? 2,
    );
    const avgStudentDifficulty =
      completedDifficulties.length > 0
        ? completedDifficulties.reduce((a, b) => a + b, 0) / completedDifficulties.length
        : 2; // Default to INTERMEDIATE

    // Get all active POSTED projects
    const projects = await this.prisma.project.findMany({
      where: { status: 'PUBLISHED' },
      include: { skills: { include: { skill: true } } },
    });

    const recommendations: Array<{
      studentId: string;
      projectId: string;
      matchScore: number;
      skillMatchScore: number;
      reputationScore: number;
      difficultyScore: number;
    }> = [];

    for (const project of projects) {
      const projectSkillIds = new Set(project.skills.map((s) => s.skillId));

      // Jaccard similarity: |intersection| / |union|
      const intersection = [...studentSkillIds].filter((id) => projectSkillIds.has(id)).length;
      const union = new Set([...studentSkillIds, ...projectSkillIds]).size;
      const skillOverlap = union > 0 ? intersection / union : 0;

      // Difficulty compatibility (inverse distance)
      const projectDifficultyWeight = RecommendationEngine.DIFFICULTY_WEIGHTS[project.difficulty] ?? 2;
      const difficultyDistance = Math.abs(avgStudentDifficulty - projectDifficultyWeight);
      const difficultyScore = Math.max(0, 1 - difficultyDistance / 3);

      let tierBonus = 0;
      if (student.clusterTier === 'ELITE') tierBonus = 0.15;
      else if (student.clusterTier === 'PROFESSIONAL') tierBonus = 0.10;
      else if (student.clusterTier === 'RISING_TALENT') tierBonus = 0.05;

      const rawScore =
        (RecommendationEngine.WEIGHTS.skillOverlap * skillOverlap) +
        (RecommendationEngine.WEIGHTS.reputation * studentReputationNormalized) +
        (RecommendationEngine.WEIGHTS.difficultyCompatibility * difficultyScore) +
        tierBonus;

      const matchScore = Math.round(rawScore * 100 * 100) / 100; // 0-100

      // Only store if score is meaningful (>10%)
      if (matchScore > 10) {
        recommendations.push({
          studentId,
          projectId: project.id,
          matchScore,
          skillMatchScore: Math.round(skillOverlap * 100 * 100) / 100,
          reputationScore: Math.round(studentReputationNormalized * 100 * 100) / 100,
          difficultyScore: Math.round(difficultyScore * 100 * 100) / 100,
        });
      }
    }

    // Upsert all recommendations in a single batch
    if (recommendations.length > 0) {
      await Promise.all(
        recommendations.map((rec) =>
          this.prisma.recommendation.upsert({
            where: { studentId_projectId: { studentId: rec.studentId, projectId: rec.projectId } },
            create: rec,
            update: {
              matchScore: rec.matchScore,
              skillMatchScore: rec.skillMatchScore,
              reputationScore: rec.reputationScore,
              difficultyScore: rec.difficultyScore,
              updatedAt: new Date(),
            },
          }),
        ),
      );
      this.logger.debug(`Generated ${recommendations.length} recommendations for student: ${studentId}`);
    }
  }

  /**
   * Get top-N project recommendations for a student (from pre-computed cache).
   */
  async getForStudent(studentId: string, limit = 10) {
    return this.prisma.recommendation.findMany({
      where: { studentId },
      orderBy: { matchScore: 'desc' },
      take: limit,
      include: {
        project: {
          include: {
            skills: { include: { skill: true } },
            client: {
              select: {
                companyName: true,
                user: { select: { name: true } },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Generate and store top-N student matches for a project (client/recruiter view).
   * Mirrors generateForStudent but scores all verified students against one project.
   */
  async generateForProject(projectId: string): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { skills: { include: { skill: true } } },
    });
    if (!project) return;

    const projectSkillIds = new Set(project.skills.map((s) => s.skillId));
    const projectDifficultyWeight = RecommendationEngine.DIFFICULTY_WEIGHTS[project.difficulty] ?? 2;

    const students = await this.prisma.student.findMany({
      where: { isActive: true, verificationStatus: 'VERIFIED', isShadowBanned: false },
      include: {
        skills: { include: { skill: true } },
        contracts: {
          where: { status: { in: ['COMPLETED', 'RELEASED'] } },
          include: { project: { select: { difficulty: true } } },
          take: 20,
        },
      },
    });

    const recommendations: Array<{
      studentId: string;
      projectId: string;
      matchScore: number;
      skillMatchScore: number;
      reputationScore: number;
      difficultyScore: number;
    }> = [];

    for (const student of students) {
      const studentSkillIds = new Set(student.skills.map((s) => s.skillId));
      const studentReputationNormalized = student.reputationScore / 100;

      const intersection = [...studentSkillIds].filter((id) => projectSkillIds.has(id)).length;
      const union = new Set([...studentSkillIds, ...projectSkillIds]).size;
      const skillOverlap = union > 0 ? intersection / union : 0;

      const completedDifficulties = student.contracts.map(
        (c) => RecommendationEngine.DIFFICULTY_WEIGHTS[c.project.difficulty] ?? 2,
      );
      const avgStudentDifficulty =
        completedDifficulties.length > 0
          ? completedDifficulties.reduce((a, b) => a + b, 0) / completedDifficulties.length
          : 2;
      const difficultyDistance = Math.abs(avgStudentDifficulty - projectDifficultyWeight);
      const difficultyScore = Math.max(0, 1 - difficultyDistance / 3);

      let tierBonus = 0;
      if (student.clusterTier === 'ELITE') tierBonus = 0.15;
      else if (student.clusterTier === 'PROFESSIONAL') tierBonus = 0.10;
      else if (student.clusterTier === 'RISING_TALENT') tierBonus = 0.05;

      const rawScore =
        (RecommendationEngine.WEIGHTS.skillOverlap * skillOverlap) +
        (RecommendationEngine.WEIGHTS.reputation * studentReputationNormalized) +
        (RecommendationEngine.WEIGHTS.difficultyCompatibility * difficultyScore) +
        tierBonus;

      const matchScore = Math.round(rawScore * 100 * 100) / 100;

      if (matchScore > 10) {
        recommendations.push({
          studentId: student.id,
          projectId,
          matchScore,
          skillMatchScore: Math.round(skillOverlap * 100 * 100) / 100,
          reputationScore: Math.round(studentReputationNormalized * 100 * 100) / 100,
          difficultyScore: Math.round(difficultyScore * 100 * 100) / 100,
        });
      }
    }

    if (recommendations.length > 0) {
      await Promise.all(
        recommendations.map((rec) =>
          this.prisma.recommendation.upsert({
            where: { studentId_projectId: { studentId: rec.studentId, projectId: rec.projectId } },
            create: rec,
            update: {
              matchScore: rec.matchScore,
              skillMatchScore: rec.skillMatchScore,
              reputationScore: rec.reputationScore,
              difficultyScore: rec.difficultyScore,
              updatedAt: new Date(),
            },
          }),
        ),
      );
      this.logger.debug(`Generated ${recommendations.length} candidate matches for project: ${projectId}`);
    }
  }

  /**
   * Get top-N student recommendations for a project (recruiter/client view).
   */
  async getForProject(projectId: string, limit = 10) {
    return this.prisma.recommendation.findMany({
      where: { projectId },
      orderBy: { matchScore: 'desc' },
      take: limit,
      include: {
        student: {
          select: {
            id: true,
            bio: true,
            reputationScore: true,
            projectsCompleted: true,
            clusterTier: true,
            user: { select: { name: true, avatarUrl: true } },
            skills: { include: { skill: true } },
            college: { select: { name: true } },
          },
        },
      },
    });
  }
}
