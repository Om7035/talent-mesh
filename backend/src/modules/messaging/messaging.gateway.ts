import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { verify } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

interface WsJwtPayload {
  sub: string;
  role?: string;
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'chat',
})
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagingGateway.name);
  
  // Map of userId to socketId
  private connectedUsers = new Map<string, string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        client.disconnect();
        return;
      }

      const secret = this.configService.get<string>('JWT_ACCESS_SECRET') || '';
      const payload = verify(token, secret) as unknown as WsJwtPayload;
      
      const userId = payload.sub;
      client.data.userId = userId;
      this.connectedUsers.set(userId, client.id);

      // Join room for user's own updates
      client.join(userId);

      this.logger.log(`Client connected: ${userId} (${client.id})`);

      // Broadcast online status to relevant users
      this.server.emit('user_online', { userId });
    } catch (err) {
      this.logger.warn(`Invalid connection attempt: ${err.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.connectedUsers.delete(userId);
      this.logger.log(`Client disconnected: ${userId}`);
      this.server.emit('user_offline', { userId });
    }
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    const userId = client.data.userId;

    // Verify user is part of conversation
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });

    if (participant) {
      client.join(`conv_${conversationId}`);
      this.logger.debug(`User ${userId} joined conv_${conversationId}`);
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    const userId = client.data.userId;
    client.to(`conv_${conversationId}`).emit('user_typing', { conversationId, userId });
  }

  /** Called internally by MessagingService to broadcast a new message */
  notifyNewMessage(conversationId: string, message: any) {
    this.server.to(`conv_${conversationId}`).emit('new_message', message);
  }

  /** Called internally by MessagingService to broadcast read receipts */
  notifyReadReceipt(conversationId: string, userId: string, messageIds: string[]) {
    this.server.to(`conv_${conversationId}`).emit('messages_read', { conversationId, userId, messageIds });
  }
}
