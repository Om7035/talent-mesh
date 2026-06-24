import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getPlatformStats() {
    const [totalUsers, totalProjects, totalContracts, totalRevenue, disputes, systemMetrics] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.project.count(),
      this.prisma.contract.count(),
      this.prisma.transaction.aggregate({ where: { type: 'PLATFORM_FEE', status: 'SUCCESS' }, _sum: { amount: true } }),
      this.prisma.dispute.count({ where: { status: 'OPEN' } }),
      this.prisma.systemMetrics.findFirst(),
    ]);

    return { 
      totalUsers, 
      totalProjects, 
      totalContracts, 
      totalRevenue: totalRevenue._sum.amount ?? 0, 
      openDisputes: disputes,
      systemMetrics 
    };
  }

  async getUsers(page = 1, limit = 20, role?: string, search?: string) {
    const where: any = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          student: { select: { isShadowBanned: true, shadowBanReason: true } },
          recruiter: { select: { isShadowBanned: true, shadowBanReason: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users: users.map((u: any) => ({
        ...u,
        isShadowBanned: u.student?.isShadowBanned || u.recruiter?.isShadowBanned || false,
        shadowBanReason: u.student?.shadowBanReason || u.recruiter?.shadowBanReason || null,
        student: undefined,
        recruiter: undefined,
      })),
      total, page, limit, totalPages: Math.ceil(total / limit),
    };
  }

  /** Hard ban: blocks login entirely. */
  async banUser(adminUserId: string, targetUserId: string, reason: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: targetUserId } });
      if (!user) throw new NotFoundException();

      const updated = await tx.user.update({ where: { id: targetUserId }, data: { isActive: false } });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'USER_BANNED',
          resource: 'User',
          resourceId: targetUserId,
          metadata: { reason }
        }
      });
      return updated;
    });

    await this.notificationsService.send({
      userId: targetUserId,
      type: 'ACCOUNT_BANNED',
      title: 'Your account has been suspended',
      message: `An administrator has suspended your account. Reason: ${reason}. You will not be able to log in until this is reversed.`,
    });

    return result;
  }

  /** Reverses a hard ban — restores login access. */
  async unbanUser(adminUserId: string, targetUserId: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: targetUserId } });
      if (!user) throw new NotFoundException();

      const updated = await tx.user.update({ where: { id: targetUserId }, data: { isActive: true } });

      await tx.auditLog.create({
        data: { userId: adminUserId, action: 'USER_UNBANNED', resource: 'User', resourceId: targetUserId },
      });
      return updated;
    });

    await this.notificationsService.send({
      userId: targetUserId,
      type: 'ACCOUNT_UNBANNED',
      title: 'Your account has been reinstated',
      message: 'An administrator has lifted the suspension on your account. You can log in again.',
    });

    return result;
  }

  /**
   * Shadow ban: restricts a STUDENT or RECRUITER's visibility/functionality
   * without blocking login. Students disappear from search/recommendations/
   * leaderboard and their applications are hidden from clients. Recruiters lose
   * access to talent discovery results. The user IS notified (unlike a typical
   * silent shadow ban) so they understand why their results changed.
   */
  async shadowBanUser(adminUserId: string, targetUserId: string, reason: string) {
    if (!reason?.trim()) throw new BadRequestException('A reason is required.');

    const user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new NotFoundException();
    if (user.role !== 'STUDENT' && user.role !== 'RECRUITER') {
      throw new BadRequestException('Shadow ban only applies to STUDENT or RECRUITER accounts.');
    }

    await this.prisma.$transaction(async (tx) => {
      if (user.role === 'STUDENT') {
        const student = await tx.student.update({
          where: { userId: targetUserId },
          data: { isShadowBanned: true, shadowBanReason: reason, shadowBannedAt: new Date(), shadowBannedById: adminUserId },
        });
        await tx.leaderboard.deleteMany({ where: { studentId: student.id } });
      } else {
        await tx.recruiter.update({
          where: { userId: targetUserId },
          data: { isShadowBanned: true, shadowBanReason: reason, shadowBannedAt: new Date(), shadowBannedById: adminUserId },
        });
      }
      await tx.auditLog.create({
        data: { userId: adminUserId, action: 'USER_SHADOW_BANNED', resource: 'User', resourceId: targetUserId, metadata: { reason } },
      });
    });

    await this.notificationsService.send({
      userId: targetUserId,
      type: 'ACCOUNT_BANNED',
      title: 'Your visibility has been restricted',
      message: user.role === 'STUDENT'
        ? `An administrator has restricted your profile's visibility to clients and recruiters. Reason: ${reason}.`
        : `An administrator has restricted your talent discovery access. Reason: ${reason}.`,
    });

    return { success: true };
  }

  async shadowUnbanUser(adminUserId: string, targetUserId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new NotFoundException();
    if (user.role !== 'STUDENT' && user.role !== 'RECRUITER') {
      throw new BadRequestException('Shadow ban only applies to STUDENT or RECRUITER accounts.');
    }

    await this.prisma.$transaction(async (tx) => {
      if (user.role === 'STUDENT') {
        await tx.student.update({
          where: { userId: targetUserId },
          data: { isShadowBanned: false, shadowBanReason: null, shadowBannedAt: null, shadowBannedById: null },
        });
      } else {
        await tx.recruiter.update({
          where: { userId: targetUserId },
          data: { isShadowBanned: false, shadowBanReason: null, shadowBannedAt: null, shadowBannedById: null },
        });
      }
      await tx.auditLog.create({
        data: { userId: adminUserId, action: 'USER_SHADOW_UNBANNED', resource: 'User', resourceId: targetUserId },
      });
    });

    await this.notificationsService.send({
      userId: targetUserId,
      type: 'ACCOUNT_UNBANNED',
      title: 'Visibility restored',
      message: 'An administrator has lifted the visibility restriction on your account.',
    });

    return { success: true };
  }

  async createUser(adminUserId: string, data: any) {
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(data.password || 'TempPassword123!', 10);
    const role = data.role || 'STUDENT';

    if ((role === 'STUDENT' || role === 'TPO') && !data.collegeId) {
      throw new BadRequestException(`collegeId is required when creating a ${role} user.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          name: data.name,
          role,
          passwordHash,
          isActive: true
        }
      });

      await tx.wallet.create({
        data: { userId: user.id, balance: 0 }
      });

      if (role === 'STUDENT') {
        await tx.student.create({
          data: { userId: user.id, collegeId: data.collegeId, departmentId: data.departmentId ?? null }
        });
      } else if (role === 'TPO') {
        await tx.tPO.create({
          data: { userId: user.id, collegeId: data.collegeId, designation: data.designation ?? null }
        });
      } else if (role === 'CLIENT') {
        await tx.client.create({
          data: { userId: user.id, companyName: data.companyName ?? null, industry: data.industry ?? null }
        });
      } else if (role === 'RECRUITER') {
        await tx.recruiter.create({
          data: { userId: user.id, companyName: data.companyName ?? 'Independent Recruiter', industry: data.industry ?? null }
        });
      } else if (role === 'ADMIN') {
        await tx.admin.create({ data: { userId: user.id, permissions: [] } });
      }

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'USER_CREATED',
          resource: 'User',
          resourceId: user.id,
          metadata: { role: user.role }
        }
      });

      return user;
    });
  }

  async updateUser(adminUserId: string, targetUserId: string, data: any) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: targetUserId } });
      if (!user) throw new NotFoundException();

      const updated = await tx.user.update({
        where: { id: targetUserId },
        data: {
          role: data.role,
          isActive: data.isActive,
          name: data.name
        }
      });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'USER_UPDATED',
          resource: 'User',
          resourceId: targetUserId,
          metadata: data
        }
      });

      return updated;
    });
  }

  async deleteUser(adminUserId: string, targetUserId: string) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: targetUserId } });
      if (!user) throw new NotFoundException();

      await tx.user.delete({ where: { id: targetUserId } });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'USER_DELETED',
          resource: 'User',
          resourceId: targetUserId,
        }
      });

      return { success: true };
    });
  }

  async getModerationQueue() {
    return this.prisma.dispute.findMany({
      where: { status: 'OPEN' },
      include: { contract: true },
      orderBy: { createdAt: 'asc' }
    });
  }

  async getAuditLogs(page = 1, limit = 50) {
    return this.prisma.auditLog.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }
}
