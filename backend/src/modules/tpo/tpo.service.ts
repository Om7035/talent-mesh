import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { VerificationStatus } from '@prisma/client';

@Injectable()
export class TpoService {
  constructor(private readonly prisma: PrismaService) {}

  async getCollegeStudents(tpoUserId: string, page = 1, limit = 20) {
    const tpo = await this.prisma.tPO.findUnique({ where: { userId: tpoUserId } });
    if (!tpo) throw new ForbiddenException();

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where: { collegeId: tpo.collegeId },
        select: {
          id: true,
          user: { select: { name: true, email: true, avatarUrl: true } },
          department: { select: { name: true } },
          reputationScore: true,
          projectsCompleted: true,
          totalEarnings: true,
          verificationStatus: true,
          clusterTier: true,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.student.count({ where: { collegeId: tpo.collegeId } }),
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

  async verifyStudent(tpoUserId: string, studentId: string) {
    const tpo = await this.prisma.tPO.findUnique({ where: { userId: tpoUserId } });
    if (!tpo) throw new ForbiddenException();

    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Student not found');
    if (student.collegeId !== tpo.collegeId) throw new ForbiddenException('You can only manage students from your own college.');

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

      return updated;
    });
  }

  async rejectStudent(tpoUserId: string, studentId: string, reason?: string) {
    const tpo = await this.prisma.tPO.findUnique({ where: { userId: tpoUserId } });
    if (!tpo) throw new ForbiddenException();

    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Student not found');
    if (student.collegeId !== tpo.collegeId) throw new ForbiddenException('You can only manage students from your own college.');

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

      return updated;
    });
  }

  async generateReport(tpoUserId: string) {
    return this.getCollegeAnalyticsSummary(tpoUserId);
  }
}
