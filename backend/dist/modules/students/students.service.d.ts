import { PrismaService } from '../../database/prisma.service';
import { UpdateStudentProfileDto, AddSkillDto, AddCertificationDto, StudentSearchDto } from './dto/student.dto';
export declare class StudentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        user: {
            name: string;
            email: string;
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
        department: {
            id: string;
            createdAt: Date;
            name: string;
            collegeId: string;
        } | null;
        leaderboard: {
            id: string;
            updatedAt: Date;
            studentId: string;
            globalRank: number;
            collegeRank: number;
            departmentRank: number;
            score: number;
        } | null;
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
        certifications: {
            id: string;
            createdAt: Date;
            name: string;
            issuer: string;
            issueDate: Date;
            credentialUrl: string | null;
            studentId: string;
        }[];
        contracts: ({
            project: {
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
    }>;
    updateProfile(userId: string, dto: UpdateStudentProfileDto): Promise<{
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
    }>;
    addSkill(userId: string, dto: AddSkillDto): Promise<{
        level: string;
        skillId: string;
        studentId: string;
        endorsed: number;
        addedAt: Date;
    }>;
    removeSkill(userId: string, skillId: string): Promise<{
        level: string;
        skillId: string;
        studentId: string;
        endorsed: number;
        addedAt: Date;
    } | undefined>;
    addCertification(userId: string, dto: AddCertificationDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        issuer: string;
        issueDate: Date;
        credentialUrl: string | null;
        studentId: string;
    }>;
    getPortfolio(studentId: string): Promise<({
        project: {
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
    })[]>;
    incrementProfileViews(studentId: string): Promise<void>;
    searchStudents(query: StudentSearchDto): Promise<{
        students: ({
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
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    verifyStudent(studentId: string, tpoUserId: string): Promise<{
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
    }>;
}
