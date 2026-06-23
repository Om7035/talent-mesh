import { RecruitersService } from './recruiters.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
export declare class RecruitersController {
    private readonly recruitersService;
    constructor(recruitersService: RecruitersService);
    discoverTalent(query: any): Promise<{
        students: ({
            user: {
                name: string;
                avatarUrl: string | null;
            };
            college: {
                name: string;
            };
            skills: ({
                skill: {
                    id: string;
                    createdAt: Date;
                    name: string;
                    category: string | null;
                };
            } & {
                level: string;
                skillId: string;
                studentId: string;
                endorsed: number;
                addedAt: Date;
            })[];
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            collegeId: string;
            departmentId: string | null;
            yearOfStudy: number | null;
            isActive: boolean;
            updatedAt: Date;
            bio: string | null;
            location: string | null;
            major: string | null;
            graduationYear: number | null;
            githubUrl: string | null;
            linkedinUrl: string | null;
            twitterUrl: string | null;
            portfolioUrl: string | null;
            reputationScore: number;
            completionRate: number;
            avgClientRating: number;
            onTimeDeliveryRate: number;
            totalEarnings: import("@prisma/client/runtime/library").Decimal;
            profileViews: number;
            projectsCompleted: number;
            verificationStatus: import(".prisma/client").$Enums.VerificationStatus;
            verifiedAt: Date | null;
            verifiedByTpoId: string | null;
            clusterTier: import(".prisma/client").$Enums.ClusterTier;
        })[];
        total: number;
        page: any;
        limit: any;
        totalPages: number;
    }>;
    shortlistStudent(user: JwtPayload, studentId: string): Promise<{
        message: string;
    }>;
    getAnalytics(user: JwtPayload): Promise<{
        shortlistedCount: number;
    }>;
}
