import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/skill.dto';
export declare class SkillsController {
    private readonly skillsService;
    constructor(skillsService: SkillsService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        category: string | null;
    }[]>;
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
    createSkill(dto: CreateSkillDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        category: string | null;
    }>;
}
