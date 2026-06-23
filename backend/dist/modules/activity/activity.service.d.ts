import { PrismaService } from '../../database/prisma.service';
export type ActivityAction = 'PROJECT_VIEWED' | 'PROJECT_APPLIED' | 'APPLICATION_ACCEPTED' | 'APPLICATION_REJECTED' | 'PROJECT_FUNDED' | 'PROJECT_SUBMITTED' | 'PROJECT_COMPLETED' | 'MESSAGE_SENT' | 'PROFILE_VIEWED' | 'RATING_GIVEN' | 'USER_LOGGED_IN' | 'USER_REGISTERED';
interface ActivityLogDto {
    userId?: string;
    action: ActivityAction;
    resource?: string;
    resourceId?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}
export declare class ActivityService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    logEvent(dto: ActivityLogDto): Promise<void>;
}
export {};
