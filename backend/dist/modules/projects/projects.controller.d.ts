import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, ProjectQueryDto } from './dto/project.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    findAll(query: ProjectQueryDto): Promise<{
        projects: any[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, user?: JwtPayload): Promise<any>;
    create(user: JwtPayload, dto: CreateProjectDto): Promise<{
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
    getMyProjects(user: JwtPayload): Promise<({
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
    duplicate(id: string, user: JwtPayload): Promise<{
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
    update(id: string, user: JwtPayload, dto: UpdateProjectDto): Promise<{
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
    cancel(id: string, user: JwtPayload): Promise<{
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
}
