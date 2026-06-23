import { ApplicationStatus } from '@prisma/client';
export declare class CreateApplicationDto {
    coverLetter?: string;
    proposedBudget?: number;
}
export declare class UpdateApplicationStatusDto {
    status: ApplicationStatus;
}
