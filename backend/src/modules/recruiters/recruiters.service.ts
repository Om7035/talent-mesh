import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RecruitersService {
  constructor(private readonly prisma: PrismaService) {}

  async discoverTalent(query: any) {
    const { skills, collegeId, minReputation, page = 1, limit = 20 } = query;
    const where: any = { isActive: true, verificationStatus: 'VERIFIED' };

    if (collegeId) where.collegeId = collegeId;
    if (minReputation) where.reputationScore = { gte: minReputation };
    if (skills && skills.length > 0) {
      where.skills = { some: { skill: { name: { in: skills } } } };
    }

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        include: {
          user: { select: { name: true, avatarUrl: true } },
          college: { select: { name: true } },
          skills: { include: { skill: true } }
        },
        orderBy: { reputationScore: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.student.count({ where })
    ]);

    return { students, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async shortlistStudent(recruiterUserId: string, studentId: string) {
    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Student not found');

    await this.prisma.auditLog.create({
      data: {
        userId: recruiterUserId,
        action: 'STUDENT_SHORTLISTED',
        resource: 'Student',
        resourceId: studentId
      }
    });

    return { message: 'Student shortlisted successfully' };
  }

  async getAnalytics(recruiterUserId: string) {
    const shortlistedCount = await this.prisma.auditLog.count({
      where: { userId: recruiterUserId, action: 'STUDENT_SHORTLISTED' }
    });

    return { shortlistedCount };
  }
}
