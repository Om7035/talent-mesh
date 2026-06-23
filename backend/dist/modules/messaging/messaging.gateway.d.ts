import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../database/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { ConfigService } from '@nestjs/config';
export declare class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly prisma;
    private readonly activityService;
    private readonly configService;
    server: Server;
    private readonly logger;
    private connectedUsers;
    constructor(prisma: PrismaService, activityService: ActivityService, configService: ConfigService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleJoinConversation(client: Socket, conversationId: string): Promise<void>;
    handleTyping(client: Socket, conversationId: string): void;
    notifyNewMessage(conversationId: string, message: any): void;
    notifyReadReceipt(conversationId: string, userId: string, messageIds: string[]): void;
}
