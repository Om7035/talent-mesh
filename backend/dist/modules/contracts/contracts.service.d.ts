import { PrismaService } from '../../database/prisma.service';
import { ReputationEngine } from '../recommendations/reputation.engine';
import { NotificationsService } from '../notifications/notifications.service';
import { SubmitDeliverableDto, ApproveDeliverableDto } from './dto/contract.dto';
export declare class ContractsService {
    private readonly prisma;
    private readonly reputationEngine;
    private readonly notificationsService;
    private readonly logger;
    private static readonly VALID_TRANSITIONS;
    constructor(prisma: PrismaService, reputationEngine: ReputationEngine, notificationsService: NotificationsService);
    createFromApplication(applicationId: string, clientUserId: string): Promise<{
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
    }>;
    acceptOffer(contractId: string, studentUserId: string): Promise<{
        message: string;
        contractId: string;
    }>;
    rejectOffer(contractId: string, studentUserId: string): Promise<{
        message: string;
        contractId: string;
    }>;
    fundEscrow(contractId: string, clientUserId: string): Promise<{
        message: string;
        contractId: string;
    }>;
    submitDeliverable(contractId: string, studentUserId: string, dto: SubmitDeliverableDto): Promise<{
        message: string;
        contractId: string;
    }>;
    approveAndRelease(contractId: string, clientUserId: string, dto: ApproveDeliverableDto): Promise<{
        message: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        contractId: string;
    }>;
    fileDispute(contractId: string, userId: string, reason: string, evidence?: string): Promise<{
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
    findOne(contractId: string, userId: string): Promise<{
        student: {
            user: {
                name: string;
                email: string;
                avatarUrl: string | null;
            };
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
        project: {
            client: {
                user: {
                    name: string;
                    email: string;
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
        };
        escrow: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            contractId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            platformFee: import("@prisma/client/runtime/library").Decimal;
            isFunded: boolean;
            isReleased: boolean;
            fundedAt: Date | null;
            releasedAt: Date | null;
            walletId: string;
        } | null;
        deliverables: {
            id: string;
            submittedAt: Date;
            contractId: string;
            feedback: string | null;
            submission: string;
            notes: string | null;
            isAccepted: boolean;
            reviewedAt: Date | null;
        }[];
        disputes: {
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
        }[];
        reviews: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isPublic: boolean;
            studentId: string | null;
            revieweeId: string;
            clientId: string | null;
            contractId: string;
            reviewerId: string;
            reviewerRole: import(".prisma/client").$Enums.Role;
            revieweeRole: import(".prisma/client").$Enums.Role;
            communication: number | null;
            quality: number | null;
            timeliness: number | null;
            professionalism: number | null;
            technicalSkill: number | null;
            rating: number;
            feedback: string;
        }[];
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
    }>;
    findByProjectId(projectId: string, userId: string): Promise<{
        student: {
            user: {
                name: string;
                email: string;
                avatarUrl: string | null;
            };
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
        project: {
            client: {
                user: {
                    name: string;
                    email: string;
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
        };
        escrow: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            contractId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            platformFee: import("@prisma/client/runtime/library").Decimal;
            isFunded: boolean;
            isReleased: boolean;
            fundedAt: Date | null;
            releasedAt: Date | null;
            walletId: string;
        } | null;
        deliverables: {
            id: string;
            submittedAt: Date;
            contractId: string;
            feedback: string | null;
            submission: string;
            notes: string | null;
            isAccepted: boolean;
            reviewedAt: Date | null;
        }[];
        disputes: {
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
        }[];
        reviews: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isPublic: boolean;
            studentId: string | null;
            revieweeId: string;
            clientId: string | null;
            contractId: string;
            reviewerId: string;
            reviewerRole: import(".prisma/client").$Enums.Role;
            revieweeRole: import(".prisma/client").$Enums.Role;
            communication: number | null;
            quality: number | null;
            timeliness: number | null;
            professionalism: number | null;
            technicalSkill: number | null;
            rating: number;
            feedback: string;
        }[];
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
    }>;
    private assertTransition;
    private getContractWithValidation;
}
