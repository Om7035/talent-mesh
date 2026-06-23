import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, name: true, role: true, avatarUrl: true, isActive: true, createdAt: true,
        student: true, client: true, recruiter: true, tpo: true, admin: true
      }
    });

    if (!user) throw new NotFoundException();
    return user;
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: { id: true, avatarUrl: true }
    });
  }

  async searchUsers(query: string, excludeId: string) {
    if (!query || query.length < 2) return [];
    return this.prisma.user.findMany({
      where: {
        id: { not: excludeId },
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true, name: true, role: true, avatarUrl: true
      },
      take: 10
    });
  }

  async updateProfile(userId: string, data: { name?: string, password?: string }) {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.password) {
      const bcrypt = require('bcryptjs');
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }
    
    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, role: true }
    });
  }
}
