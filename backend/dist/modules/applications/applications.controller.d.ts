import { ApplicationsService } from './applications.service';
import { CreateApplicationDto, UpdateApplicationStatusDto } from './dto/application.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
export declare class ApplicationsController {
    private readonly applicationsService;
    constructor(applicationsService: ApplicationsService);
    apply(projectId: string, user: JwtPayload, dto: CreateApplicationDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        projectId: string;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        coverLetter: string | null;
        proposedBudget: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    getProjectApplications(projectId: string, user: JwtPayload): Promise<({
        student: {
            user: {
                name: string;
                avatarUrl: string | null;
            };
            college: {
                id: string;
                createdAt: Date;
                name: string;
                updatedAt: Date;
                domain: string;
                address: string | null;
                city: string | null;
                country: string;
                isVerified: boolean;
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
    updateStatus(id: string, user: JwtPayload, dto: UpdateApplicationStatusDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        projectId: string;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        coverLetter: string | null;
        proposedBudget: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    updateApplication(id: string, user: JwtPayload, dto: Partial<CreateApplicationDto>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        projectId: string;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        coverLetter: string | null;
        proposedBudget: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    getMyApplications(user: JwtPayload): Promise<({
        project: {
            title: string;
            status: import(".prisma/client").$Enums.ProjectStatus;
            budget: import("@prisma/client/runtime/library").Decimal;
            difficulty: import(".prisma/client").$Enums.DifficultyLevel;
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
    withdraw(id: string, user: JwtPayload): Promise<void>;
}
