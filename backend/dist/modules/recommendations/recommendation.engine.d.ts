import { Queue } from 'bullmq';
import { PrismaService } from '../../database/prisma.service';
export declare class RecommendationEngine {
    private readonly recommendationsQueue;
    private readonly prisma;
    private readonly logger;
    private static readonly WEIGHTS;
    private static readonly DIFFICULTY_WEIGHTS;
    constructor(recommendationsQueue: Queue, prisma: PrismaService);
    enqueueForProject(projectId: string): Promise<void>;
    enqueueForStudent(studentId: string): Promise<void>;
    generateForStudent(studentId: string): Promise<void>;
    getForStudent(studentId: string, limit?: number): Promise<({
        project: {
            client: {
                user: {
                    name: string;
                };
                companyName: string | null;
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        reputationScore: number;
        studentId: string;
        projectId: string;
        matchScore: number;
        skillMatchScore: number;
        difficultyScore: number;
    })[]>;
    getForProject(projectId: string, limit?: number): Promise<({
        student: {
            user: {
                name: string;
                avatarUrl: string | null;
            };
            college: {
                name: string;
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
        reputationScore: number;
        studentId: string;
        projectId: string;
        matchScore: number;
        skillMatchScore: number;
        difficultyScore: number;
    })[]>;
}
