import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.skill.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async findOrCreate(name: string, category?: string) {
    return this.prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name, category: category ?? 'Other' }
    });
  }

  async getSkillsWithStats() {
    return this.prisma.skill.findMany({
      include: {
        _count: {
          select: { students: true, projects: true }
        }
      },
      orderBy: { students: { _count: 'desc' } }
    });
  }
}
