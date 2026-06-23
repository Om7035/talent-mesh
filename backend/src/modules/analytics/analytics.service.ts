import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStudentAnalytics(studentUserId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId: studentUserId },
      include: {
        contracts: {
          include: { project: { select: { title: true, difficulty: true, budget: true } } },
          orderBy: { createdAt: 'asc' },
        },
        reviews: { select: { rating: true, createdAt: true } },
        skills: { include: { skill: true }, orderBy: { endorsed: 'desc' } },
        leaderboard: true,
      },
    });

    if (!student) return null;

    // Build monthly earnings timeline
    const monthlyEarnings = this.buildMonthlyTimeline(student.contracts);

    // Skill distribution
    const skillDistribution = student.skills.map((s) => ({
      name: s.skill.name,
      level: s.level,
      endorsed: s.endorsed,
    }));

    return {
      overview: {
        reputationScore: student.reputationScore,
        totalEarnings: student.totalEarnings,
        projectsCompleted: student.projectsCompleted,
        completionRate: Math.round(student.completionRate * 100),
        avgRating: student.avgClientRating,
        onTimeDeliveryRate: Math.round(student.onTimeDeliveryRate * 100),
        profileViews: student.profileViews,
        globalRank: student.leaderboard?.globalRank ?? null,
        collegeRank: student.leaderboard?.collegeRank ?? null,
      },
      monthlyEarnings,
      skillDistribution,
      recentContracts: student.contracts.slice(-5).reverse(),
    };
  }

  async getCollegeAnalytics(collegeId: string) {
    const [students, college] = await Promise.all([
      this.prisma.student.findMany({
        where: { collegeId },
        include: {
          department: { select: { name: true } },
          skills: { include: { skill: { select: { name: true, category: true } } } },
          contracts: { where: { status: { in: ['COMPLETED', 'RELEASED'] } } },
        },
      }),
      this.prisma.college.findUnique({
        where: { id: collegeId },
        include: { departments: true },
      }),
    ]);

    const totalEarnings = students.reduce((s, st) => s + Number(st.totalEarnings), 0);
    const avgReputation = students.length
      ? students.reduce((s, st) => s + st.reputationScore, 0) / students.length
      : 0;

    // Skill distribution across all students
    const skillCountMap = new Map<string, number>();
    students.forEach((s) => {
      s.skills.forEach((sk) => {
        const key = sk.skill.category ?? sk.skill.name;
        skillCountMap.set(key, (skillCountMap.get(key) ?? 0) + 1);
      });
    });

    const skillDistribution = Array.from(skillCountMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Monthly placement trends (contracts completed per month)
    const placementTrends = this.buildPlacementTrends(students);

    return {
      college: { id: college?.id, name: college?.name },
      overview: {
        totalStudents: students.length,
        avgReputationScore: Math.round(avgReputation * 10) / 10,
        totalEarnings,
        totalPlacements: students.reduce((s, st) => s + st.projectsCompleted, 0),
      },
      skillDistribution,
      placementTrends,
      topStudents: students
        .sort((a, b) => b.reputationScore - a.reputationScore)
        .slice(0, 10)
        .map((s) => ({
          id: s.id,
          reputation: s.reputationScore,
          earnings: s.totalEarnings,
          projects: s.projectsCompleted,
          department: s.department?.name,
        })),
    };
  }

  async getClientAnalytics(clientUserId: string) {
    const client = await this.prisma.client.findUnique({
      where: { userId: clientUserId },
      include: {
        projects: true,
      },
    });

    if (!client) return null;

    const wallet = await this.prisma.wallet.findUnique({ where: { userId: clientUserId } });

    const projectsPosted = client.projects.length;
    const projectsActive = client.projects.filter(p => p.status === 'ASSIGNED' || p.status === 'IN_PROGRESS').length;
    const projectsCompleted = client.projects.filter(p => p.status === 'COMPLETED').length;
    const projectsCancelled = client.projects.filter(p => p.status === 'CANCELLED').length;
    
    const hiringRate = projectsPosted > 0 ? (client.projects.filter(p => p.status !== 'PUBLISHED' && p.status !== 'CANCELLED').length / projectsPosted) * 100 : 0;

    return {
      overview: {
        projectsPosted,
        projectsActive,
        projectsCompleted,
        projectsCancelled,
        hiringRate: Math.round(hiringRate),
        totalSpent: client.totalSpent,
        avgRating: client.avgRating,
        escrowFunds: wallet?.lockedBalance || 0,
        availableBalance: wallet?.balance || 0,
      },
      recentProjects: client.projects.slice(-5).reverse(),
    };
  }

  async getPlatformAnalytics() {
    const [
      totalUsers,
      totalProjects,
      totalContracts,
      totalEarnings,
      escrowLocked,
      recentSignups,
      totalDisputes,
      totalMessages,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.project.count(),
      this.prisma.contract.count(),
      this.prisma.wallet.aggregate({ _sum: { balance: true } }),
      this.prisma.wallet.aggregate({ _sum: { lockedBalance: true } }),
      this.prisma.user.count({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      }),
      this.prisma.dispute.count(),
      this.prisma.message.count(),
    ]);

    const usersByRole = await this.prisma.user.groupBy({
      by: ['role'],
      _count: { _all: true },
    });

    const projectsByStatus = await this.prisma.project.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    return {
      overview: {
        totalUsers,
        totalProjects,
        totalContracts,
        platformVolume: totalEarnings._sum.balance ?? 0,
        escrowVolume: escrowLocked._sum.lockedBalance ?? 0,
        totalDisputes,
        totalMessages,
        newUsersThisMonth: recentSignups,
      },
      usersByRole: usersByRole.map((r) => ({ role: r.role, count: r._count._all })),
      projectsByStatus: projectsByStatus.map((p) => ({
        status: p.status,
        count: p._count._all,
      })),
    };
  }

  private buildMonthlyTimeline(contracts: any[]) {
    const map = new Map<string, { earnings: number; projects: number }>();
    contracts.forEach((c) => {
      if (c.status === 'RELEASED' || c.status === 'COMPLETED') {
        const key = new Date(c.completedAt ?? c.createdAt).toISOString().slice(0, 7);
        const existing = map.get(key) ?? { earnings: 0, projects: 0 };
        map.set(key, {
          earnings: existing.earnings + (c.agreedBudget ?? 0),
          projects: existing.projects + 1,
        });
      }
    });
    return Array.from(map.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12);
  }

  private buildPlacementTrends(students: any[]) {
    const map = new Map<string, { placements: number }>();
    students.forEach((s) => {
      s.contracts.forEach((c: any) => {
        const key = new Date(c.completedAt ?? c.createdAt).toISOString().slice(0, 7);
        const existing = map.get(key) ?? { placements: 0 };
        map.set(key, { placements: existing.placements + 1 });
      });
    });
    return Array.from(map.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12);
  }
}
