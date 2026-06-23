import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCollegeDto } from './dto/college.dto';

@Injectable()
export class CollegesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.college.findMany({
      orderBy: { name: 'asc' },
      include: { departments: { orderBy: { name: 'asc' } } },
    });
  }

  async create(dto: CreateCollegeDto) {
    return this.prisma.college.create({
      data: {
        name: dto.name,
        domain: dto.domain,
        address: dto.address ?? null,
        city: dto.city ?? null,
        country: dto.country ?? 'India',
        isVerified: dto.isVerified ?? false,
      },
    });
  }
}
