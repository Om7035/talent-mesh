import { CollegesService } from './colleges.service';
import { CreateCollegeDto } from './dto/college.dto';
export declare class CollegesController {
    private readonly collegesService;
    constructor(collegesService: CollegesService);
    findAll(): Promise<({
        departments: {
            id: string;
            createdAt: Date;
            name: string;
            collegeId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        domain: string;
        address: string | null;
        city: string | null;
        country: string;
        isVerified: boolean;
    })[]>;
    create(dto: CreateCollegeDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        domain: string;
        address: string | null;
        city: string | null;
        country: string;
        isVerified: boolean;
    }>;
}
