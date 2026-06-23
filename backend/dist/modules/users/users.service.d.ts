import { PrismaService } from '../../database/prisma.service';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<{
        student: {
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
        } | null;
        client: {
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
        } | null;
        recruiter: {
            id: string;
            createdAt: Date;
            userId: string;
            companyName: string;
            industry: string | null;
            updatedAt: Date;
            isVerified: boolean;
            website: string | null;
        } | null;
        admin: {
            id: string;
            createdAt: Date;
            userId: string;
            updatedAt: Date;
            permissions: string[];
        } | null;
        tpo: {
            id: string;
            createdAt: Date;
            userId: string;
            collegeId: string;
            updatedAt: Date;
            designation: string | null;
        } | null;
        id: string;
        createdAt: Date;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        avatarUrl: string | null;
        isActive: boolean;
    }>;
    updateAvatar(userId: string, avatarUrl: string): Promise<{
        id: string;
        avatarUrl: string | null;
    }>;
    searchUsers(query: string, excludeId: string): Promise<{
        id: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        avatarUrl: string | null;
    }[]>;
    updateProfile(userId: string, data: {
        name?: string;
        password?: string;
    }): Promise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
}
