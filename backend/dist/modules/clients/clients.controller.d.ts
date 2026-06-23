import { ClientsService } from './clients.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
    getProfile(user: JwtPayload): Promise<{
        totalSpent: number | import("@prisma/client/runtime/library").Decimal;
        user: {
            name: string;
            email: string;
            avatarUrl: string | null;
        };
        projects: {
            id: string;
            title: string;
            status: import(".prisma/client").$Enums.ProjectStatus;
            applicationCount: number;
        }[];
        id: string;
        createdAt: Date;
        userId: string;
        companyName: string | null;
        industry: string | null;
        updatedAt: Date;
        isVerified: boolean;
        projectsCompleted: number;
        website: string | null;
        avgRating: number;
    }>;
    updateProfile(user: JwtPayload, dto: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        companyName: string | null;
        industry: string | null;
        updatedAt: Date;
        isVerified: boolean;
        projectsCompleted: number;
        website: string | null;
        avgRating: number;
        totalSpent: import("@prisma/client/runtime/library").Decimal;
    }>;
    getClientCandidates(user: JwtPayload): Promise<({
        student: {
            user: {
                name: string;
                avatarUrl: string | null;
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
        };
        project: {
            title: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        projectId: string;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        coverLetter: string | null;
        proposedBudget: import("@prisma/client/runtime/library").Decimal | null;
    })[]>;
}
