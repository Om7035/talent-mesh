import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateReviewDto } from './dto/review.dto';
import { ProjectStatus } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(reviewerUserId: string, contractId: string, dto: CreateReviewDto) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: { project: true, student: { select: { userId: true, id: true } } }
    });

    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.status !== ProjectStatus.COMPLETED && contract.status !== ProjectStatus.RELEASED) {
      throw new ForbiddenException('Can only review completed or released contracts');
    }

    const client = await this.prisma.client.findUnique({ where: { id: contract.project.clientId } });
    
    // Determine reviewer role and target
    let reviewerRole: 'STUDENT' | 'CLIENT' | null = null;
    let revieweeId: string | null = null;
    let revieweeRole: 'STUDENT' | 'CLIENT' | null = null;

    if (contract.student.userId === reviewerUserId) {
      reviewerRole = 'STUDENT';
      revieweeId = contract.project.clientId;
      revieweeRole = 'CLIENT';
    } else if (client?.userId === reviewerUserId) {
      reviewerRole = 'CLIENT';
      revieweeId = contract.student.id;
      revieweeRole = 'STUDENT';
    } else {
      throw new ForbiddenException('Only contract participants can leave a review');
    }

    const existing = await this.prisma.review.findUnique({
      where: { contractId_reviewerId: { contractId, reviewerId: reviewerUserId } }
    });

    if (existing) throw new ConflictException('You have already reviewed this contract');

    let finalRating = dto.rating;
    if (!finalRating) {
      const scores = [dto.communication, dto.quality, dto.timeliness, dto.professionalism, dto.technicalSkill].filter(Boolean) as number[];
      finalRating = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 5.0;
    }

    const review = await this.prisma.review.create({
      data: {
        contractId,
        reviewerId: reviewerUserId,
        reviewerRole,
        revieweeId,
        revieweeRole,
        rating: finalRating,
        communication: dto.communication,
        quality: dto.quality,
        timeliness: dto.timeliness,
        professionalism: dto.professionalism,
        technicalSkill: dto.technicalSkill,
        feedback: dto.feedback ?? '',
        studentId: revieweeRole === 'STUDENT' ? revieweeId : null,
        clientId: revieweeRole === 'CLIENT' ? revieweeId : null,
      }
    });

    if (revieweeRole === 'CLIENT') {
      const allReviews = await this.prisma.review.findMany({
        where: { clientId: revieweeId },
        select: { rating: true }
      });
      const newAvg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await this.prisma.client.update({
        where: { id: revieweeId },
        data: { avgRating: newAvg }
      });
    }

    return review;
  }

  async getStudentReviews(studentId: string) {
    return this.prisma.review.findMany({
      where: { studentId },
      include: {
        contract: {
          select: { project: { select: { title: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
