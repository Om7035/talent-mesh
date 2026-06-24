import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateStudentProfileDto, AddSkillDto, AddCertificationDto, StudentSearchDto } from './dto/student.dto';
import { RecommendationEngine } from '../recommendations/recommendation.engine';

@Injectable()
export class StudentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly recommendationEngine: RecommendationEngine,
  ) {}

  async getProfile(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true, email: true, avatarUrl: true } },
        college: true,
        department: true,
        skills: { include: { skill: true } },
        certifications: true,
        leaderboard: true,
        contracts: {
          where: { status: { in: ['COMPLETED', 'RELEASED'] } },
          include: { project: true },
          take: 5,
          orderBy: { completedAt: 'desc' },
        },
      },
    });
    if (!student) throw new NotFoundException('Student profile not found');
    return student;
  }

  async updateProfile(userId: string, dto: UpdateStudentProfileDto) {
    return this.prisma.student.update({
      where: { userId },
      data: dto,
    });
  }

  async addSkill(userId: string, dto: AddSkillDto) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) throw new NotFoundException('Student not found');

    let skillId = dto.skillId;
    if (!skillId && dto.skillName) {
      const skill = await this.prisma.skill.upsert({
        where: { name: dto.skillName },
        update: {},
        create: { name: dto.skillName },
      });
      skillId = skill.id;
    }

    if (!skillId) throw new Error('Skill ID or Name required');

    const result = await this.prisma.studentSkill.upsert({
      where: { studentId_skillId: { studentId: student.id, skillId } },
      update: { level: dto.level },
      create: { studentId: student.id, skillId, level: dto.level },
    });

    await this.recommendationEngine.enqueueForStudent(student.id);

    return result;
  }

  async removeSkill(userId: string, skillId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) return;
    return this.prisma.studentSkill.delete({
      where: { studentId_skillId: { studentId: student.id, skillId } },
    });
  }

  async addCertification(userId: string, dto: AddCertificationDto) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) throw new NotFoundException();

    return this.prisma.certification.create({
      data: {
        studentId: student.id,
        name: dto.name,
        issuer: dto.issuer,
        issueDate: new Date(dto.issueDate),
        credentialUrl: dto.credentialUrl,
      },
    });
  }

  async getPortfolio(studentId: string) {
    return this.prisma.contract.findMany({
      where: { studentId, status: { in: ['COMPLETED', 'RELEASED'] } },
      include: {
        project: { include: { skills: { include: { skill: true } }, client: { select: { companyName: true } } } },
        reviews: { where: { revieweeId: studentId } },
      },
      orderBy: { completedAt: 'desc' },
    });
  }

  async incrementProfileViews(studentId: string) {
    this.prisma.student.update({
      where: { id: studentId },
      data: { profileViews: { increment: 1 } },
    }).catch(() => {});
  }

  async searchStudents(query: StudentSearchDto) {
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
          skills: { include: { skill: true } },
        },
        orderBy: { reputationScore: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.student.count({ where }),
    ]);

    return { students, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async verifyStudent(studentId: string, tpoUserId: string) {
    const tpo = await this.prisma.tPO.findUnique({ where: { userId: tpoUserId } });
    if (!tpo) throw new NotFoundException('TPO not found');
    
    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Student not found');

    if (student.collegeId !== tpo.collegeId) {
      throw new ForbiddenException('You can only verify students from your own college.');
    }
    
    return this.prisma.student.update({
      where: { id: studentId },
      data: {
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
        verifiedByTpoId: tpo.id,
      },
    });
  }
}
