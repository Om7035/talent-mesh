import { PrismaService } from '../../database/prisma.service';
import { MessagingGateway } from './messaging.gateway';
import { ActivityService } from '../activity/activity.service';
export declare class MessagingService {
    private readonly prisma;
    private readonly gateway;
    private readonly activityService;
    constructor(prisma: PrismaService, gateway: MessagingGateway, activityService: ActivityService);
    getOrCreateConversation(currentUserId: string, otherUserId: string): Promise<{
        participants: ({
            user: {
                id: string;
                name: string;
                role: import(".prisma/client").$Enums.Role;
                avatarUrl: string | null;
            };
        } & {
            userId: string;
            unreadCount: number;
            conversationId: string;
            joinedAt: Date;
        })[];
        messages: {
            id: string;
            createdAt: Date;
            content: string;
            isRead: boolean;
            conversationId: string;
            senderId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        lastMessage: string | null;
        lastMessageAt: Date | null;
    }>;
    getMyConversations(userId: string): Promise<{
        id: string;
        lastMessage: string | null;
        lastMessageAt: Date | null;
        unreadCount: number;
        participants: {
            id: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            avatarUrl: string | null;
        }[];
        lastMessagePreview: string | null;
    }[]>;
    getMessages(conversationId: string, userId: string, page?: number, limit?: number): Promise<({
        sender: {
            id: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        content: string;
        isRead: boolean;
        conversationId: string;
        senderId: string;
    })[]>;
    sendMessage(conversationId: string, senderId: string, content: string): Promise<{
        sender: {
            id: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        content: string;
        isRead: boolean;
        conversationId: string;
        senderId: string;
    }>;
    getTotalUnread(userId: string): Promise<number>;
}
