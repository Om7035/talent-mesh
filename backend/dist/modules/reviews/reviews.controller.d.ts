import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/review.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    createReview(contractId: string, user: JwtPayload, dto: CreateReviewDto): Promise<{
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
