import { Queue } from 'bullmq';
import { PrismaService } from '../../database/prisma.service';
interface SendNotificationDto {
    userId: string;
    type: string;
    title: string;
    message: string;
    actionUrl?: string;
    metadata?: Record<string, unknown>;
}
export declare class NotificationsService {
    private readonly notifQueue;
    private readonly prisma;
    private readonly logger;
    constructor(notifQueue: Queue, prisma: PrismaService);
    send(dto: SendNotificationDto): Promise<void>;
    sendBulk(userIds: string[], dto: Omit<SendNotificationDto, 'userId'>): Promise<void>;
    getUserNotifications(userId: string, page?: number, limit?: number): Promise<{
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
    markAsRead(notificationId: string, userId: string): Promise<{
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
    markAllAsRead(userId: string): Promise<void>;
}
export {};
