import { PrismaService } from '../../database/prisma.service';
import { CreateProjectDto, UpdateProjectDto, ProjectQueryDto } from './dto/project.dto';
import { ProjectStatus } from '@prisma/client';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
export declare class ProjectsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(clientUserId: string, dto: CreateProjectDto): Promise<{
        client: {
            user: {
                name: string;
            };
        } & {
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
        };
        skills: ({
            skill: {
                id: string;
                createdAt: Date;
                name: string;
                category: string | null;
            };
        } & {
            skillId: string;
            projectId: string;
        })[];
    } & {
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
    }>;
    findAll(query: ProjectQueryDto): Promise<{
        projects: any[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, requestingUser?: JwtPayload): Promise<any>;
    update(id: string, clientUserId: string, dto: UpdateProjectDto & {
        status?: ProjectStatus;
    }): Promise<{
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
    }>;
    duplicate(id: string, clientUserId: string): Promise<{
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
    }>;
    cancel(id: string, clientUserId: string): Promise<{
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
    }>;
    getClientProjects(clientUserId: string): Promise<({
        _count: {
            applications: number;
            contracts: number;
        };
        skills: ({
            skill: {
                id: string;
                createdAt: Date;
                name: string;
                category: string | null;
            };
        } & {
            skillId: string;
            projectId: string;
        })[];
    } & {
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
    })[]>;
    private findProjectAndVerifyOwnership;
    private sanitizeProject;
}
