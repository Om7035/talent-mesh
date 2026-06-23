import { NotificationsService } from './notifications.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getMyNotifications(user: JwtPayload, page?: number, limit?: number): Promise<{
        notifications: {
            message: string;
            id: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            userId: string;
            type: import(".prisma/client").$Enums.NotificationType;
            title: string;
            actionUrl: string | null;
            isRead: boolean;
        }[];
        total: number;
        unreadCount: number;
        page: number;
        limit: number;
    }>;
    markRead(id: string, user: JwtPayload): Promise<{
        message: string;
        id: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        userId: string;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        actionUrl: string | null;
        isRead: boolean;
    }>;
    markAllRead(user: JwtPayload): Promise<void>;
}
