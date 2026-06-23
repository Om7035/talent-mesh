import { PrismaService } from '../../database/prisma.service';
export declare class AdminService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getPlatformStats(): Promise<{
        totalUsers: number;
        totalProjects: number;
        totalContracts: number;
        totalRevenue: number | import("@prisma/client/runtime/library").Decimal;
        openDisputes: number;
        systemMetrics: {
            id: string;
            lastClusterRunAt: Date;
            totalBeginners: number;
            totalRisingTalents: number;
            totalProfessionals: number;
            totalElites: number;
        } | null;
    }>;
    getUsers(page?: number, limit?: number, role?: string, search?: string): Promise<{
        users: {
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
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    banUser(adminUserId: string, targetUserId: string, reason: string): Promise<{
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
    }>;
    createUser(adminUserId: string, data: any): Promise<{
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
    }>;
    updateUser(adminUserId: string, targetUserId: string, data: any): Promise<{
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
    }>;
    deleteUser(adminUserId: string, targetUserId: string): Promise<{
        success: boolean;
    }>;
    getModerationQueue(): Promise<({
        contract: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.DisputeStatus;
        contractId: string;
        reason: string;
        filedById: string;
        filedAgainst: string;
        evidence: string | null;
        resolution: string | null;
        resolvedById: string | null;
        resolvedAt: Date | null;
    })[]>;
    getAuditLogs(page?: number, limit?: number): Promise<({
        user: {
            name: string;
            email: string;
        } | null;
    } & {
        id: string;
        action: string;
        resource: string | null;
        resourceId: string | null;
        ipAddress: string | null;
        userAgent: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        userId: string | null;
    })[]>;
}
