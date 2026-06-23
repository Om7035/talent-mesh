export declare class UpdateStudentProfileDto {
    bio?: string;
    location?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    twitterUrl?: string;
    portfolioUrl?: string;
    yearOfStudy?: number;
    major?: string;
}
export declare class AddSkillDto {
    skillId?: string;
    skillName?: string;
    level: string;
}
export declare class AddCertificationDto {
    name: string;
    issuer: string;
    issueDate: string;
    credentialUrl?: string;
}
export declare class StudentSearchDto {
    skills?: string[];
    collegeId?: string;
    minReputation?: number;
    page?: number;
    limit?: number;
}
