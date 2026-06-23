import { MessagingService } from './messaging.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
declare class CreateConversationDto {
    recipientId: string;
}
declare class SendMessageDto {
    content: string;
}
export declare class MessagingController {
    private readonly messagingService;
    constructor(messagingService: MessagingService);
    getMyConversations(user: JwtPayload): Promise<{
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
    getOrCreate(user: JwtPayload, dto: CreateConversationDto): Promise<{
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
    getMessages(user: JwtPayload, id: string, limit: number): Promise<({
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
    sendMessage(user: JwtPayload, id: string, dto: SendMessageDto): Promise<{
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
    getUnreadCount(user: JwtPayload): Promise<number>;
}
export {};
