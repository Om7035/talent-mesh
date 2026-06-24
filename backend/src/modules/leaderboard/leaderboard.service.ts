import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * LeaderboardService — Efficient ranking system across multiple dimensions.
 *
 * Ranking Algorithm:
 *   compositeScore = (0.40 × reputationScore)
 *                  + (0.35 × completionRateScore)
 *                  + (0.25 × earningsGrowthScore)
 *
 * Dimensions:
 *   - Global: All students on the platform
 *   - College: Students within the same college
 *   - Department: Students within the same department
 *   - Skill: Top students per skill (skill expert leaderboard)
 *
 * Performance:
 *   - Ranks are pre-computed and stored in the Leaderboard table
 *   - Use PostgreSQL window functions for efficient dense_rank() computation
 *   - Rebuilt asynchronously after reputation score changes
 */
@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────
  // PUBLIC QUERY METHODS
  // ─────────────────────────────────────────────────────────────────

  async getGlobalLeaderboard(page = 1, limit = 20) {
    const [entries, total] = await Promise.all([
      this.prisma.leaderboard.findMany({
        orderBy: { globalRank: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          student: {
            include: {
              user: { select: { name: true, avatarUrl: true } },
              college: { select: { name: true } },
              skills: {
                include: { skill: { select: { name: true } } },
                orderBy: { endorsed: 'desc' },
                take: 3,
              },
            },
          },
        },
      }),
      this.prisma.leaderboard.count(),
    ]);

    return {
      entries: entries.map((e) => this.formatEntry(e)),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getCollegeLeaderboard(collegeId: string, page = 1, limit = 20) {
    const [entries, total] = await Promise.all([
      this.prisma.leaderboard.findMany({
        where: { student: { collegeId } },
        orderBy: { collegeRank: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          student: {
            include: {
              user: { select: { name: true, avatarUrl: true } },
              department: { select: { name: true } },
            },
          },
        },
      }),
      this.prisma.leaderboard.count({ where: { student: { collegeId } } }),
    ]);

    return {
      entries: entries.map((e) => this.formatEntry(e, 'collegeRank')),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getSkillLeaderboard() {
    // Aggregate top students per skill
    const skills = await this.prisma.skill.findMany({
      include: {
        students: {
          orderBy: { endorsed: 'desc' },
          take: 1,
          include: {
            student: {
              include: {
                user: { select: { name: true } },
              },
            },
          },
        },
        _count: { select: { students: true } },
      },
      orderBy: { students: { _count: 'desc' } },
      take: 20,
    });

    return skills.map((skill, idx) => ({
      rank: idx + 1,
      skill: skill.name,
      expertCount: skill._count.students,
      topExpert: skill.students[0]?.student.user.name ?? 'N/A',
    }));
  }

  async getStudentRank(studentId: string) {
    return this.prisma.leaderboard.findUnique({
      where: { studentId },
      include: {
        student: {
          include: {
            user: { select: { name: true, avatarUrl: true } },
            college: { select: { name: true } },
            department: { select: { name: true } },
          },
        },
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // RANKING COMPUTATION (called by BullMQ worker)
  // ─────────────────────────────────────────────────────────────────

  /**
   * Rebuilds rankings for all students using raw PostgreSQL window functions
   * for optimal performance on large datasets.
   * Uses DENSE_RANK() to handle ties correctly.
   */
  async rebuildGlobalRankings(): Promise<void> {
    this.logger.log('Rebuilding global leaderboard rankings...');

    // Use raw SQL for efficient window function execution
    const rankings = await this.prisma.$queryRaw<
      Array<{ studentId: string; globalRank: number; collegeRank: number; departmentRank: number; score: number }>
    >`
      WITH ranked AS (
        SELECT
          s.id AS "studentId",
          -- Composite score formula
          (
            s."reputationScore" * 0.40 +
            s."completionRate" * 100 * 0.35 +
            LEAST(s."totalEarnings" / 1000.0, 100) * 0.25
          ) AS score,
          DENSE_RANK() OVER (
            ORDER BY (
              s."reputationScore" * 0.40 +
              s."completionRate" * 100 * 0.35 +
              LEAST(s."totalEarnings" / 1000.0, 100) * 0.25
            ) DESC
          ) AS "globalRank",
          DENSE_RANK() OVER (
            PARTITION BY s."collegeId"
            ORDER BY (
              s."reputationScore" * 0.40 +
              s."completionRate" * 100 * 0.35 +
              LEAST(s."totalEarnings" / 1000.0, 100) * 0.25
            ) DESC
          ) AS "collegeRank",
          DENSE_RANK() OVER (
            PARTITION BY s."departmentId"
            ORDER BY (
              s."reputationScore" * 0.40 +
              s."completionRate" * 100 * 0.35 +
              LEAST(s."totalEarnings" / 1000.0, 100) * 0.25
            ) DESC
          ) AS "departmentRank"
        FROM students s
        WHERE s."isActive" = true AND s."isShadowBanned" = false
      )
      SELECT * FROM ranked
    `;

    // Upsert all rankings in batch
    await Promise.all(
      rankings.map((r) =>
        this.prisma.leaderboard.upsert({
          where: { studentId: r.studentId },
          create: {
            studentId: r.studentId,
            globalRank: Number(r.globalRank),
            collegeRank: Number(r.collegeRank),
            departmentRank: Number(r.departmentRank),
            score: Number(r.score),
          },
          update: {
            globalRank: Number(r.globalRank),
            collegeRank: Number(r.collegeRank),
            departmentRank: Number(r.departmentRank),
            score: Number(r.score),
            updatedAt: new Date(),
          },
        }),
      ),
    );

    this.logger.log(`Rebuilt rankings for ${rankings.length} students`);
  }

  private formatEntry(entry: any, rankField = 'globalRank') {
    return {
      rank: entry[rankField],
      score: entry.score,
      student: {
        id: entry.student.id,
        name: entry.student.user.name,
        avatarUrl: entry.student.user.avatarUrl,
        college: entry.student.college?.name,
        department: entry.student.department?.name,
        reputationScore: entry.student.reputationScore,
        totalEarnings: entry.student.totalEarnings,
        projectsCompleted: entry.student.projectsCompleted,
        topSkills: entry.student.skills?.map((s: any) => s.skill.name),
      },
    };
  }
}
