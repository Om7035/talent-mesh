import { PrismaService } from '../../database/prisma.service';
export declare class AnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getStudentAnalytics(studentUserId: string): Promise<{
        overview: {
            reputationScore: number;
            totalEarnings: import("@prisma/client/runtime/library").Decimal;
            projectsCompleted: number;
            completionRate: number;
            avgRating: number;
            onTimeDeliveryRate: number;
            profileViews: number;
            globalRank: number | null;
            collegeRank: number | null;
        };
        monthlyEarnings: {
            earnings: number;
            projects: number;
            month: string;
        }[];
        skillDistribution: {
            name: string;
            level: string;
            endorsed: number;
        }[];
        recentContracts: ({
            project: {
                title: string;
                budget: import("@prisma/client/runtime/library").Decimal;
                difficulty: import(".prisma/client").$Enums.DifficultyLevel;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            completedAt: Date | null;
            studentId: string;
            projectId: string;
            agreedBudget: import("@prisma/client/runtime/library").Decimal;
            timelineDays: number;
            status: import(".prisma/client").$Enums.ProjectStatus;
            startedAt: Date | null;
            submittedAt: Date | null;
            dueAt: Date | null;
            wasOnTime: boolean | null;
        })[];
    } | null>;
    getCollegeAnalytics(collegeId: string): Promise<{
        college: {
            id: string | undefined;
            name: string | undefined;
        };
        overview: {
            totalStudents: number;
            avgReputationScore: number;
            totalEarnings: number;
            totalPlacements: number;
        };
        skillDistribution: {
            name: string;
            count: number;
        }[];
        placementTrends: {
            placements: number;
            month: string;
        }[];
        topStudents: {
            id: string;
            reputation: number;
            earnings: import("@prisma/client/runtime/library").Decimal;
            projects: number;
            department: string | undefined;
        }[];
    }>;
    getClientAnalytics(clientUserId: string): Promise<{
        overview: {
            projectsPosted: number;
            projectsActive: number;
            projectsCompleted: number;
            projectsCancelled: number;
            hiringRate: number;
            totalSpent: import("@prisma/client/runtime/library").Decimal;
            avgRating: number;
            escrowFunds: number | import("@prisma/client/runtime/library").Decimal;
            availableBalance: number | import("@prisma/client/runtime/library").Decimal;
        };
        recentProjects: {
            id: string;
            createdAt: Date;
            description: string;
            title: string;
            updatedAt: Date;
            category: string;
            timelineDays: number;
            status: import(".prisma/client").$Enums.ProjectStatus;
            clientId: string;
            budget: import("@prisma/client/runtime/library").Decimal;
            difficulty: import(".prisma/client").$Enums.DifficultyLevel;
            projectType: string;
            ndaRequired: boolean;
            hideClientName: boolean;
            communicationPref: string;
            applicationCount: number;
            viewCount: number;
        }[];
    } | null>;
    getPlatformAnalytics(): Promise<{
        overview: {
            totalUsers: number;
            totalProjects: number;
            totalContracts: number;
            platformVolume: number | import("@prisma/client/runtime/library").Decimal;
            escrowVolume: number | import("@prisma/client/runtime/library").Decimal;
            totalDisputes: number;
            totalMessages: number;
            newUsersThisMonth: number;
        };
        usersByRole: {
            role: import(".prisma/client").$Enums.Role;
            count: number;
        }[];
        projectsByStatus: {
            status: import(".prisma/client").$Enums.ProjectStatus;
            count: number;
        }[];
    }>;
    private buildMonthlyTimeline;
    private buildPlacementTrends;
}
