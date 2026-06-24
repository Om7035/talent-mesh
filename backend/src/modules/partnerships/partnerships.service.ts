import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Role, PartnershipStatus, PartnershipInitiator } from '@prisma/client';
import { RequestPartnershipDto } from './dto/request-partnership.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PartnershipsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async requestPartnership(user: JwtPayload, dto: RequestPartnershipDto) {
    let collegeId: string;
    let recruiterId: string;
    let initiator: PartnershipInitiator;
    let recipientUserId: string;
    let title: string;
    let message: string;
    let actionUrl: string;

    if (user.role === Role.TPO) {
      const tpo = await this.prisma.tPO.findUnique({
        where: { userId: user.sub },
        include: { college: true },
      });
      if (!tpo) throw new ForbiddenException();

      const recruiter = await this.prisma.recruiter.findUnique({
        where: { id: dto.recruiterId },
      });
      if (!recruiter) throw new NotFoundException('Recruiter not found');

      collegeId = tpo.collegeId;
      recruiterId = dto.recruiterId!;
      initiator = PartnershipInitiator.TPO;
      recipientUserId = recruiter.userId;
      title = 'New College Partnership Request';
      message = `${tpo.college.name} wants to partner with you for direct talent pipelines.`;
      actionUrl = '/dashboard/recruiter/network'; // Example URL, adjust based on frontend

    } else { // RECRUITER
      const recruiter = await this.prisma.recruiter.findUnique({
        where: { userId: user.sub },
      });
      if (!recruiter) throw new ForbiddenException();

      const college = await this.prisma.college.findUnique({
        where: { id: dto.collegeId },
      });
      if (!college) throw new NotFoundException('College not found');

      collegeId = dto.collegeId!;
      recruiterId = recruiter.id;
      initiator = PartnershipInitiator.RECRUITER;
      
      // Notify all TPOs in that college
      const tpos = await this.prisma.tPO.findMany({ where: { collegeId } });
      if (tpos.length > 0) {
        recipientUserId = tpos[0].userId; // We'll notify all of them below
      } else {
        recipientUserId = ''; // College has no TPOs yet
      }
      
      title = 'New Recruiter Partnership Request';
      message = `${recruiter.companyName} wants to partner with your college.`;
      actionUrl = '/dashboard/tpo/network'; // Example URL
    }

    // Check if partnership already exists
    const existing = await this.prisma.collegePartnership.findUnique({
      where: {
        collegeId_recruiterId: {
          collegeId,
          recruiterId,
        }
      }
    });

    if (existing) {
      throw new BadRequestException(`A partnership is already ${existing.status}`);
    }

    const partnership = await this.prisma.collegePartnership.create({
      data: {
        collegeId,
        recruiterId,
        status: PartnershipStatus.PENDING,
        initiatedBy: initiator,
        initiatedById: user.sub,
      }
    });

    // Send notification
    if (initiator === PartnershipInitiator.TPO) {
      await this.notificationsService.send({
        userId: recipientUserId,
        type: 'SYSTEM_ALERT', // or add a new enum type for PARTNERSHIP_REQUEST
        title,
        message,
        actionUrl,
      });
    } else if (initiator === PartnershipInitiator.RECRUITER) {
      const tpos = await this.prisma.tPO.findMany({ where: { collegeId } });
      for (const tpo of tpos) {
        await this.notificationsService.send({
          userId: tpo.userId,
          type: 'SYSTEM_ALERT',
          title,
          message,
          actionUrl,
        });
      }
    }

    return partnership;
  }

  async acceptPartnership(id: string, user: JwtPayload) {
    const partnership = await this.prisma.collegePartnership.findUnique({
      where: { id },
      include: { college: { include: { tpos: true } }, recruiter: true },
    });
    if (!partnership) throw new NotFoundException('Partnership not found');
    if (partnership.status !== PartnershipStatus.PENDING) {
      throw new BadRequestException('Partnership is not pending');
    }
    if (partnership.initiatedById === user.sub) {
      throw new ForbiddenException('Cannot accept your own request');
    }

    // Verify ownership
    if (user.role === Role.TPO) {
      const tpo = await this.prisma.tPO.findUnique({ where: { userId: user.sub } });
      if (!tpo || tpo.collegeId !== partnership.collegeId) throw new ForbiddenException();
    } else if (user.role === Role.RECRUITER) {
      const recruiter = await this.prisma.recruiter.findUnique({ where: { userId: user.sub } });
      if (!recruiter || recruiter.id !== partnership.recruiterId) throw new ForbiddenException();
    } else {
      throw new ForbiddenException();
    }

    const updated = await this.prisma.collegePartnership.update({
      where: { id },
      data: {
        status: PartnershipStatus.ACTIVE,
        respondedAt: new Date(),
      }
    });

    // Notify initiator
    let title = 'Partnership Accepted';
    let message = '';
    let actionUrl = '';
    
    if (partnership.initiatedBy === PartnershipInitiator.TPO) {
      message = `${partnership.recruiter.companyName} has accepted your partnership request.`;
      actionUrl = '/dashboard/tpo/network';
    } else {
      message = `${partnership.college.name} has accepted your partnership request.`;
      actionUrl = '/dashboard/recruiter/network';
    }

    await this.notificationsService.send({
      userId: partnership.initiatedById,
      type: 'SYSTEM_ALERT',
      title,
      message,
      actionUrl,
    });

    return updated;
  }

  async rejectPartnership(id: string, user: JwtPayload) {
    const partnership = await this.prisma.collegePartnership.findUnique({
      where: { id },
    });
    if (!partnership) throw new NotFoundException('Partnership not found');
    if (partnership.status !== PartnershipStatus.PENDING) {
      throw new BadRequestException('Partnership is not pending');
    }
    if (partnership.initiatedById === user.sub) {
      throw new ForbiddenException('Cannot reject your own request');
    }

    // Verify ownership
    if (user.role === Role.TPO) {
      const tpo = await this.prisma.tPO.findUnique({ where: { userId: user.sub } });
      if (!tpo || tpo.collegeId !== partnership.collegeId) throw new ForbiddenException();
    } else if (user.role === Role.RECRUITER) {
      const recruiter = await this.prisma.recruiter.findUnique({ where: { userId: user.sub } });
      if (!recruiter || recruiter.id !== partnership.recruiterId) throw new ForbiddenException();
    } else {
      throw new ForbiddenException();
    }

    return this.prisma.collegePartnership.update({
      where: { id },
      data: {
        status: PartnershipStatus.REJECTED,
        respondedAt: new Date(),
      }
    });
  }

  async getMyPartnerships(user: JwtPayload) {
    if (user.role === Role.TPO) {
      const tpo = await this.prisma.tPO.findUnique({ where: { userId: user.sub } });
      if (!tpo) throw new ForbiddenException();

      return this.prisma.collegePartnership.findMany({
        where: { collegeId: tpo.collegeId },
        include: {
          recruiter: {
            select: {
              id: true,
              companyName: true,
              industry: true,
              user: { select: { name: true, avatarUrl: true } },
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (user.role === Role.RECRUITER) {
      const recruiter = await this.prisma.recruiter.findUnique({ where: { userId: user.sub } });
      if (!recruiter) throw new ForbiddenException();

      return this.prisma.collegePartnership.findMany({
        where: { recruiterId: recruiter.id },
        include: {
          college: {
            select: {
              id: true,
              name: true,
              domain: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      throw new ForbiddenException();
    }
  }
}
