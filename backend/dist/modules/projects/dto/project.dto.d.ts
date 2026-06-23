import { DifficultyLevel } from '@prisma/client';
export declare class CreateProjectDto {
    title: string;
    description: string;
    budget: number;
    timelineDays: number;
    difficulty: DifficultyLevel;
    category: string;
    projectType?: string;
    ndaRequired?: boolean;
    hideClientName?: boolean;
    communicationPref?: string;
    skillIds?: string[];
}
declare const UpdateProjectDto_base: import("@nestjs/common").Type<Partial<CreateProjectDto>>;
export declare class UpdateProjectDto extends UpdateProjectDto_base {
}
export declare class ProjectQueryDto {
    search?: string;
    category?: string;
    difficulty?: DifficultyLevel;
    minBudget?: number;
    maxBudget?: number;
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
}
export {};
