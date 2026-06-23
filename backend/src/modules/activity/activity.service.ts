import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export type ActivityAction = 
  | 'PROJECT_VIEWED'
  | 'PROJECT_APPLIED'
  | 'APPLICATION_ACCEPTED'
  | 'APPLICATION_REJECTED'
  | 'PROJECT_FUNDED'
  | 'PROJECT_SUBMITTED'
  | 'PROJECT_COMPLETED'
  | 'MESSAGE_SENT'
  | 'PROFILE_VIEWED'
  | 'RATING_GIVEN'
  | 'USER_LOGGED_IN'
  | 'USER_REGISTERED';

interface ActivityLogDto {
  userId?: string;
  action: ActivityAction;
  resource?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Logs a standardized activity event using the existing AuditLog infrastructure.
   * This forms the basis for Analytics, Recommendations, and Trust Metrics.
   */
  async logEvent(dto: ActivityLogDto) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: dto.userId,
          action: dto.action,
          resource: dto.resource,
          resourceId: dto.resourceId,
          metadata: dto.metadata ?? {},
          ipAddress: dto.ipAddress,
          userAgent: dto.userAgent,
        },
      });
    } catch (error) {
      // Swallow errors to prevent activity logging from breaking core workflows
      this.logger.error(`Failed to log activity event: ${dto.action}`, error);
    }
  }
}
