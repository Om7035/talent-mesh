import { PrismaService } from '../../database/prisma.service';
import { CreateApplicationDto } from './dto/application.dto';
import { ApplicationStatus } from '@prisma/client';
export declare class ApplicationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    apply(studentUserId: string, projectId: string, dto: CreateApplicationDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        projectId: string;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        coverLetter: string | null;
        proposedBudget: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    updateApplication(studentUserId: string, applicationId: string, dto: Partial<CreateApplicationDto>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        projectId: string;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        coverLetter: string | null;
        proposedBudget: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    getApplicationsForProject(clientUserId: string, projectId: string): Promise<({
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
    updateStatus(clientUserId: string, applicationId: string, status: ApplicationStatus): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        projectId: string;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        coverLetter: string | null;
        proposedBudget: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    getMyApplications(studentUserId: string): Promise<({
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
    withdrawApplication(studentUserId: string, applicationId: string): Promise<void>;
}
