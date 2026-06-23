import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true, email: true, avatarUrl: true } },
        projects: {
          where: { status: { notIn: ['COMPLETED', 'RELEASED', 'CANCELLED'] } },
          select: { id: true, title: true, status: true, applicationCount: true }
        }
      }
    });

    if (!client) throw new NotFoundException('Client profile not found');

    const totalSpent = await this.prisma.transaction.aggregate({
      where: {
        wallet: { userId },
        type: 'ESCROW_RELEASE',
        status: 'SUCCESS'
      },
      _sum: { amount: true }
    });

    return { ...client, totalSpent: totalSpent._sum.amount ?? 0 };
  }

  async updateProfile(userId: string, dto: any) {
    return this.prisma.client.update({
      where: { userId },
      data: dto
    });
  }

  async getClientCandidates(userId: string) {
    const client = await this.prisma.client.findUnique({ where: { userId } });
    if (!client) throw new NotFoundException();

    return this.prisma.projectApplication.findMany({
      where: { project: { clientId: client.id } },
      include: {
        student: {
          include: {
            user: { select: { name: true, avatarUrl: true } },
            skills: { include: { skill: true } }
          }
        },
        project: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
