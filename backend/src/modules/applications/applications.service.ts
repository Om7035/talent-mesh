import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateApplicationDto, UpdateApplicationStatusDto } from './dto/application.dto';
import { ApplicationStatus, ProjectStatus } from '@prisma/client';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async apply(studentUserId: string, projectId: string, dto: CreateApplicationDto) {
    const student = await this.prisma.student.findUnique({ where: { userId: studentUserId } });
    if (!student) throw new ForbiddenException('Student profile required');
    if (student.verificationStatus !== 'VERIFIED') {
      throw new BadRequestException('Your profile must be verified by your TPO to apply to projects.');
    }

    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.status !== ProjectStatus.PUBLISHED && project.status !== ProjectStatus.APPLICATIONS_OPEN) {
      throw new BadRequestException('This project is no longer accepting applications.');
    }

    const existing = await this.prisma.projectApplication.findUnique({
      where: { projectId_studentId: { projectId, studentId: student.id } },
    });
    if (existing) throw new ConflictException('You have already applied to this project.');

    return this.prisma.$transaction(async (tx) => {
      const app = await tx.projectApplication.create({
        data: {
          projectId,
          studentId: student.id,
          coverLetter: dto.coverLetter,
          proposedBudget: dto.proposedBudget,
        },
      });

      await tx.project.update({
        where: { id: projectId },
        data: { applicationCount: { increment: 1 } },
      });

      return app;
    });
  }

  async updateApplication(studentUserId: string, applicationId: string, dto: Partial<CreateApplicationDto>) {
    const student = await this.prisma.student.findUnique({ where: { userId: studentUserId } });
    if (!student) throw new ForbiddenException();

    const app = await this.prisma.projectApplication.findUnique({ where: { id: applicationId } });
    if (!app) throw new NotFoundException();
    if (app.studentId !== student.id) throw new ForbiddenException('Not your application.');

    if (app.status !== 'APPLIED' && app.status !== 'PENDING') {
      throw new BadRequestException('Can only update applications that are still pending review.');
    }

    return this.prisma.projectApplication.update({
      where: { id: applicationId },
      data: {
        ...(dto.coverLetter && { coverLetter: dto.coverLetter }),
        ...(dto.proposedBudget && { proposedBudget: dto.proposedBudget }),
      },
    });
  }

  async getApplicationsForProject(clientUserId: string, projectId: string) {
    const client = await this.prisma.client.findUnique({ where: { userId: clientUserId } });
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });

    if (!client || !project || project.clientId !== client.id) {
      throw new ForbiddenException('Only the project owner can view applications.');
    }

    return this.prisma.projectApplication.findMany({
      where: { projectId },
      include: {
        student: {
          include: {
            user: { select: { name: true, avatarUrl: true } },
            skills: { include: { skill: true } },
            college: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(clientUserId: string, applicationId: string, status: ApplicationStatus) {
    const application = await this.prisma.projectApplication.findUnique({
      where: { id: applicationId },
      include: { project: true },
    });

    if (!application) throw new NotFoundException();

    const client = await this.prisma.client.findUnique({ where: { userId: clientUserId } });
    if (!client || application.project.clientId !== client.id) {
      throw new ForbiddenException('Only the project owner can update application status.');
    }

    if (application.project.status !== ProjectStatus.PUBLISHED && application.project.status !== ProjectStatus.APPLICATIONS_OPEN && application.project.status !== ProjectStatus.ASSIGNED) {
      throw new BadRequestException('Cannot update applications for closed projects.');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.projectApplication.update({
        where: { id: applicationId },
        data: { status },
      });

      if (status === 'ACCEPTED') {
        // Reject all other applications
        await tx.projectApplication.updateMany({
          where: { projectId: application.projectId, id: { not: applicationId } },
          data: { status: 'REJECTED' },
        });
      }

      return updated;
    });
  }

  async getMyApplications(studentUserId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId: studentUserId } });
    if (!student) return [];

    return this.prisma.projectApplication.findMany({
      where: { studentId: student.id },
      include: {
        project: {
          select: { title: true, status: true, difficulty: true, budget: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async withdrawApplication(studentUserId: string, applicationId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId: studentUserId } });
    if (!student) throw new ForbiddenException();

    const app = await this.prisma.projectApplication.findUnique({ where: { id: applicationId } });
    if (!app) throw new NotFoundException();
    if (app.studentId !== student.id) throw new ForbiddenException('Not your application.');

    if (app.status === 'ACCEPTED') {
      throw new BadRequestException('Cannot withdraw an accepted application.');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.projectApplication.update({
        where: { id: applicationId },
        data: { status: 'WITHDRAWN' },
      });
      await tx.project.update({
        where: { id: app.projectId },
        data: { applicationCount: { decrement: 1 } },
      });
    });
  }
}
