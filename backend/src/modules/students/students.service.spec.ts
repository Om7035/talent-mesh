import { Test, TestingModule } from '@nestjs/testing';
import { StudentsService } from './students.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('StudentsService - TPO Verification', () => {
  let service: StudentsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        {
          provide: PrismaService,
          useValue: {
            tPO: {
              findUnique: jest.fn(),
            },
            student: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should throw ForbiddenException if TPO tries to verify student from another college', async () => {
    (prismaService.tPO.findUnique as jest.Mock).mockResolvedValue({ id: 'tpo-1', collegeId: 'college-A' });
    (prismaService.student.findUnique as jest.Mock).mockResolvedValue({ id: 'student-1', collegeId: 'college-B' });

    await expect(
      service.verifyStudent('student-1', 'tpo-user-1')
    ).rejects.toThrow(ForbiddenException);
  });

  it('should successfully verify student if college matches', async () => {
    (prismaService.tPO.findUnique as jest.Mock).mockResolvedValue({ id: 'tpo-1', collegeId: 'college-A' });
    (prismaService.student.findUnique as jest.Mock).mockResolvedValue({ id: 'student-1', collegeId: 'college-A' });
    (prismaService.student.update as jest.Mock).mockResolvedValue({ id: 'student-1', verificationStatus: 'VERIFIED' });

    const result = await service.verifyStudent('student-1', 'tpo-user-1');
    expect(result.verificationStatus).toBe('VERIFIED');
  });
});
