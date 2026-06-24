import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { VerificationStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TpoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getCollegeStudents(
    tpoUserId: string,
    page = 1,
    limit = 20,
    filters: { search?: string; departmentId?: string; verificationStatus?: string; clusterTier?: string } = {},
  ) {
    const tpo = await this.prisma.tPO.findUnique({ where: { userId: tpoUserId } });
    if (!tpo) throw new ForbiddenException();

    const where: any = { collegeId: tpo.collegeId };
    if (filters.departmentId) where.departmentId = filters.departmentId;
    if (filters.verificationStatus) where.verificationStatus = filters.verificationStatus;
    if (filters.clusterTier) where.clusterTier = filters.clusterTier;
    if (filters.search) {
      where.user = { name: { contains: filters.search, mode: 'insensitive' } };
    }

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        select: {
          id: true,
          phone: true,
          isShadowBanned: true,
          shadowBanReason: true,
          tpoRecommended: true,
          user: { select: { name: true, email: true, avatarUrl: true } },
          department: { select: { id: true, name: true } },
          reputationScore: true,
          projectsCompleted: true,
          totalEarnings: true,
          verificationStatus: true,
          clusterTier: true,
        },
        orderBy: { reputationScore: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.student.count({ where }),
    ]);
    return { students, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getCollegeAnalyticsSummary(tpoUserId: string) {
    const tpo = await this.prisma.tPO.findUnique({ where: { userId: tpoUserId } });
    if (!tpo) throw new ForbiddenException();

    const students = await this.prisma.student.findMany({
      where: { collegeId: tpo.collegeId },
      include: { skills: { include: { skill: true } } }
    });

    const totalStudents = students.length;
    const avgReputation = students.reduce((sum, s) => sum + s.reputationScore, 0) / (totalStudents || 1);
    const totalEarnings = students.reduce((sum, s) => sum + Number(s.totalEarnings), 0);

    return { totalStudents, avgReputation, totalEarnings };
  }

  async getPendingVerifications(tpoUserId: string) {
    const tpo = await this.prisma.tPO.findUnique({ where: { userId: tpoUserId } });
    if (!tpo) throw new ForbiddenException();

    return this.prisma.student.findMany({
      where: { collegeId: tpo.collegeId, verificationStatus: VerificationStatus.PENDING },
      include: { user: true, department: true }
    });
  }

  private async assertOwnCollegeStudent(tpoUserId: string, studentId: string) {
    const tpo = await this.prisma.tPO.findUnique({ where: { userId: tpoUserId } });
    if (!tpo) throw new ForbiddenException();

    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Student not found');
    if (student.collegeId !== tpo.collegeId) {
      throw new ForbiddenException('You can only manage students from your own college.');
    }
    return { tpo, student };
  }

  async verifyStudent(tpoUserId: string, studentId: string) {
    const { tpo, student } = await this.assertOwnCollegeStudent(tpoUserId, studentId);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.student.update({
        where: { id: studentId },
        data: { verificationStatus: VerificationStatus.VERIFIED, verifiedAt: new Date(), verifiedByTpoId: tpo.id }
      });

      await tx.auditLog.create({
        data: {
          userId: tpo.userId,
          action: 'STUDENT_VERIFIED',
          resource: 'Student',
          resourceId: studentId,
        }
      });

      await this.notificationsService.send({
        userId: student.userId,
        type: 'STUDENT_VERIFIED',
        title: 'Profile Verified!',
        message: 'Your TPO has verified your profile. You can now apply to projects.',
        actionUrl: '/student/profile',
      });

      return updated;
    });
  }

  async rejectStudent(tpoUserId: string, studentId: string, reason?: string) {
    const { tpo, student } = await this.assertOwnCollegeStudent(tpoUserId, studentId);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.student.update({
        where: { id: studentId },
        data: { verificationStatus: VerificationStatus.REJECTED, verifiedByTpoId: tpo.id }
      });

      await tx.auditLog.create({
        data: {
          userId: tpo.userId,
          action: 'STUDENT_REJECTED',
          resource: 'Student',
          resourceId: studentId,
          metadata: { reason }
        }
      });

      await this.notificationsService.send({
        userId: student.userId,
        type: 'STUDENT_REJECTED',
        title: 'Verification Rejected',
        message: reason
          ? `Your TPO rejected your verification request: ${reason}`
          : 'Your TPO rejected your verification request. Please update your profile and contact them.',
        actionUrl: '/student/profile',
      });

      return updated;
    });
  }

  /**
   * Shadow ban — restricts a student's visibility platform-wide (excluded from
   * search, recommendations, leaderboard, and client-visible applicant lists)
   * without blocking their account. The student IS notified, unlike a typical
   * "shadow ban" — this is a visibility restriction with transparency, not deception.
   */
  async shadowBanStudent(tpoUserId: string, studentId: string, reason: string) {
    const { tpo, student } = await this.assertOwnCollegeStudent(tpoUserId, studentId);
    if (!reason?.trim()) throw new BadRequestException('A reason is required to restrict a student.');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.student.update({
        where: { id: studentId },
        data: { isShadowBanned: true, shadowBanReason: reason, shadowBannedAt: new Date(), shadowBannedById: tpo.userId },
      });

      // Remove from leaderboard immediately rather than waiting for the next rebuild cycle
      await tx.leaderboard.deleteMany({ where: { studentId } });

      await tx.auditLog.create({
        data: { userId: tpo.userId, action: 'STUDENT_SHADOW_BANNED', resource: 'Student', resourceId: studentId, metadata: { reason } },
      });

      await this.notificationsService.send({
        userId: student.userId,
        type: 'ACCOUNT_BANNED',
        title: 'Your visibility has been restricted',
        message: `Your TPO has restricted your profile's visibility to clients and recruiters. Reason: ${reason}. You can still use your account, but won't appear in search or recommendations until this is lifted.`,
        actionUrl: '/student/profile',
      });

      return updated;
    });
  }

  async shadowUnbanStudent(tpoUserId: string, studentId: string) {
    const { tpo, student } = await this.assertOwnCollegeStudent(tpoUserId, studentId);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.student.update({
        where: { id: studentId },
        data: { isShadowBanned: false, shadowBanReason: null, shadowBannedAt: null, shadowBannedById: null },
      });

      await tx.auditLog.create({
        data: { userId: tpo.userId, action: 'STUDENT_SHADOW_UNBANNED', resource: 'Student', resourceId: studentId },
      });

      await this.notificationsService.send({
        userId: student.userId,
        type: 'ACCOUNT_UNBANNED',
        title: 'Visibility restored',
        message: 'Your TPO has lifted the visibility restriction on your profile. You now appear in search and recommendations again.',
        actionUrl: '/student/profile',
      });

      return updated;
    });
  }

  async toggleRecommended(tpoUserId: string, studentId: string) {
    const { student } = await this.assertOwnCollegeStudent(tpoUserId, studentId);
    return this.prisma.student.update({
      where: { id: studentId },
      data: { tpoRecommended: !student.tpoRecommended },
    });
  }

  /**
   * TPO recommends one of their students for a specific job posting. This is a
   * signal surfaced to the client alongside applicants — the client still makes
   * the final hiring decision.
   */
  async recommendStudentForProject(tpoUserId: string, studentId: string, projectId: string, message?: string) {
    const { tpo, student } = await this.assertOwnCollegeStudent(tpoUserId, studentId);

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { client: { include: { user: true } } },
    });
    if (!project) throw new NotFoundException('Project not found.');

    const recommendation = await this.prisma.tpoRecommendation.upsert({
      where: { studentId_projectId: { studentId, projectId } },
      create: { tpoId: tpo.id, studentId, projectId, message },
      update: { message },
    });

    await this.notificationsService.send({
      userId: project.client.userId,
      type: 'TPO_RECOMMENDATION',
      title: 'A TPO recommended a student for your project',
      message: `A TPO has recommended a student for "${project.title}".${message ? ` Note: ${message}` : ''}`,
      actionUrl: `/client/projects/${projectId}`,
    });

    return recommendation;
  }

  async generateReport(tpoUserId: string) {
    return this.getCollegeAnalyticsSummary(tpoUserId);
  }

  async getHiringClients(tpoUserId: string) {
    const tpo = await this.prisma.tPO.findUnique({ where: { userId: tpoUserId } });
    if (!tpo) throw new ForbiddenException();

    const contracts = await this.prisma.contract.findMany({
      where: { student: { collegeId: tpo.collegeId } },
      include: {
        project: {
          include: { client: { include: { user: { select: { name: true, avatarUrl: true } } } } },
        },
      },
      distinct: ['projectId'], // dedupe if a client hired multiple students from this college
    });

    const seen = new Map();
    for (const c of contracts) {
      const client = c.project.client;
      if (!seen.has(client.id)) {
        seen.set(client.id, {
          id: client.id,
          name: client.user.name,
          avatarUrl: client.user.avatarUrl,
          companyName: client.companyName,
          industry: client.industry,
          projectsHired: 0,
        });
      }
      seen.get(client.id).projectsHired += 1;
    }
    return Array.from(seen.values());
  }
}
