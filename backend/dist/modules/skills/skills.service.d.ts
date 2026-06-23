import { PrismaService } from '../../database/prisma.service';
export declare class SkillsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        category: string | null;
    }[]>;
    findOrCreate(name: string, category?: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        category: string | null;
    }>;
    getSkillsWithStats(): Promise<({
        _count: {
            students: number;
            projects: number;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        category: string | null;
    })[]>;
}
