import { PrismaService } from '../../database/prisma.service';
import { CreateReviewDto } from './dto/review.dto';
export declare class ReviewsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createReview(reviewerUserId: string, contractId: string, dto: CreateReviewDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isPublic: boolean;
        studentId: string | null;
        revieweeId: string;
        clientId: string | null;
        contractId: string;
        reviewerId: string;
        reviewerRole: import(".prisma/client").$Enums.Role;
        revieweeRole: import(".prisma/client").$Enums.Role;
        communication: number | null;
        quality: number | null;
        timeliness: number | null;
        professionalism: number | null;
        technicalSkill: number | null;
        rating: number;
        feedback: string;
    }>;
    getStudentReviews(studentId: string): Promise<({
        contract: {
            project: {
                title: string;
            };
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isPublic: boolean;
        studentId: string | null;
        revieweeId: string;
        clientId: string | null;
        contractId: string;
        reviewerId: string;
        reviewerRole: import(".prisma/client").$Enums.Role;
        revieweeRole: import(".prisma/client").$Enums.Role;
        communication: number | null;
        quality: number | null;
        timeliness: number | null;
        professionalism: number | null;
        technicalSkill: number | null;
        rating: number;
        feedback: string;
    })[]>;
}
