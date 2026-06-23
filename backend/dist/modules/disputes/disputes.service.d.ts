import { PrismaService } from '../../database/prisma.service';
import { ResolveDisputeDto } from './dto/dispute.dto';
import { Role } from '@prisma/client';
export declare class DisputesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        contract: {
            project: {
                title: string;
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
    findOne(disputeId: string, userId: string, role: Role): Promise<{
        contract: {
            student: {
                userId: string;
            };
            project: {
                title: string;
                clientId: string;
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
    }>;
    resolve(adminUserId: string, disputeId: string, dto: ResolveDisputeDto): Promise<{
        message: string;
    }>;
}
