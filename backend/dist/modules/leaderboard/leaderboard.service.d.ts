import { PrismaService } from '../../database/prisma.service';
export declare class LeaderboardService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getGlobalLeaderboard(page?: number, limit?: number): Promise<{
        entries: {
            rank: any;
            score: any;
            student: {
                id: any;
                name: any;
                avatarUrl: any;
                college: any;
                department: any;
                reputationScore: any;
                totalEarnings: any;
                projectsCompleted: any;
                topSkills: any;
            };
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getCollegeLeaderboard(collegeId: string, page?: number, limit?: number): Promise<{
        entries: {
            rank: any;
            score: any;
            student: {
                id: any;
                name: any;
                avatarUrl: any;
                college: any;
                department: any;
                reputationScore: any;
                totalEarnings: any;
                projectsCompleted: any;
                topSkills: any;
            };
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getSkillLeaderboard(): Promise<{
        rank: number;
        skill: string;
        expertCount: number;
        topExpert: string;
    }[]>;
    getStudentRank(studentId: string): Promise<({
        student: {
            user: {
                name: string;
                avatarUrl: string | null;
            };
            college: {
                name: string;
            };
            department: {
                name: string;
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
        };
    } & {
        id: string;
        updatedAt: Date;
        studentId: string;
        globalRank: number;
        collegeRank: number;
        departmentRank: number;
        score: number;
    }) | null>;
    rebuildGlobalRankings(): Promise<void>;
    private formatEntry;
}
