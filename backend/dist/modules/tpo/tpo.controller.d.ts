import { TpoService } from './tpo.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
export declare class TpoController {
    private readonly tpoService;
    constructor(tpoService: TpoService);
    getCollegeStudents(user: JwtPayload, page?: number, limit?: number): Promise<{
        students: {
            user: {
                name: string;
                email: string;
                avatarUrl: string | null;
            };
            department: {
                name: string;
            } | null;
            id: string;
            reputationScore: number;
            totalEarnings: import("@prisma/client/runtime/library").Decimal;
            projectsCompleted: number;
            verificationStatus: import(".prisma/client").$Enums.VerificationStatus;
            clusterTier: import(".prisma/client").$Enums.ClusterTier;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getCollegeAnalyticsSummary(user: JwtPayload): Promise<{
        totalStudents: number;
        avgReputation: number;
        totalEarnings: number;
    }>;
    getPendingVerifications(user: JwtPayload): Promise<({
        user: {
            id: string;
            createdAt: Date;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            refreshToken: string | null;
            passwordHash: string;
            avatarUrl: string | null;
            isActive: boolean;
            lastLoginAt: Date | null;
            updatedAt: Date;
            passwordResetToken: string | null;
            resetTokenExpiry: Date | null;
        };
        department: {
            id: string;
            createdAt: Date;
            name: string;
            collegeId: string;
        } | null;
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
    })[]>;
    verifyStudent(studentId: string, user: JwtPayload): Promise<{
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
    }>;
    rejectStudent(studentId: string, user: JwtPayload, reason?: string): Promise<{
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
    }>;
    generateReport(user: JwtPayload): Promise<{
        totalStudents: number;
        avgReputation: number;
        totalEarnings: number;
    }>;
}
