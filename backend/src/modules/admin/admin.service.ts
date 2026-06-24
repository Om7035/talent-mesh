import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

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
      this.prisma.user.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.user.count({ where }),
    ]);
    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async banUser(adminUserId: string, targetUserId: string, reason: string) {
    return this.prisma.$transaction(async (tx) => {
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
