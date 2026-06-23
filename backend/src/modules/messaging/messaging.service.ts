import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MessagingGateway } from './messaging.gateway';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class MessagingService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => MessagingGateway))
    private readonly gateway: MessagingGateway,
    private readonly activityService: ActivityService,
  ) {}

  /** Get or create a 1:1 conversation between two users */
  async getOrCreateConversation(currentUserId: string, otherUserId: string) {
    // Check if other user exists
    const otherUser = await this.prisma.user.findUnique({ where: { id: otherUserId }, select: { id: true, name: true, avatarUrl: true, role: true } });
    if (!otherUser) throw new NotFoundException('User not found');

    // Find existing conversation with both users
    const existing = await this.prisma.conversation.findFirst({
      where: {
        participants: {
          every: { userId: { in: [currentUserId, otherUserId] } },
        },
        AND: [
          { participants: { some: { userId: currentUserId } } },
          { participants: { some: { userId: otherUserId } } },
        ],
      },
      include: {
        participants: { include: { user: { select: { id: true, name: true, avatarUrl: true, role: true } } } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (existing) return existing;

    // Create new conversation
    return this.prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId: currentUserId },
            { userId: otherUserId },
          ],
        },
      },
      include: {
        participants: { include: { user: { select: { id: true, name: true, avatarUrl: true, role: true } } } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
  }

  /** Get all conversations for the current user */
  async getMyConversations(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: { some: { userId } },
      },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, avatarUrl: true, role: true } } },
        },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    // Shape each conversation so the "other" user is easy to identify
    return conversations.map(conv => {
      const otherParticipants = conv.participants.filter(p => p.userId !== userId);
      const me = conv.participants.find(p => p.userId === userId);
      return {
        id: conv.id,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        unreadCount: me?.unreadCount || 0,
        participants: otherParticipants.map(p => p.user),
        lastMessagePreview: conv.messages[0]?.content || null,
      };
    });
  }

  /** Get all messages in a conversation */
  async getMessages(conversationId: string, userId: string, page = 1, limit = 50) {
    // Verify user is a participant
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!participant) throw new ForbiddenException('Not a participant in this conversation');

    const unreadMessages = await this.prisma.message.findMany({
      where: { conversationId, senderId: { not: userId }, isRead: false },
      select: { id: true },
    });

    if (unreadMessages.length > 0) {
      // Mark messages as read
      await this.prisma.message.updateMany({
        where: { id: { in: unreadMessages.map(m => m.id) } },
        data: { isRead: true },
      });
      // Reset unread count
      await this.prisma.conversationParticipant.update({
        where: { conversationId_userId: { conversationId, userId } },
        data: { unreadCount: 0 },
      });

      // Notify other participants that messages were read
      this.gateway.notifyReadReceipt(conversationId, userId, unreadMessages.map(m => m.id));
    }

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      include: { sender: { select: { id: true, name: true, avatarUrl: true, role: true } } },
      orderBy: { createdAt: 'asc' },
      skip: 0,
      take: limit,
    });

    return messages;
  }

  /** Send a message in a conversation */
  async sendMessage(conversationId: string, senderId: string, content: string) {
    // Verify sender is a participant
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId: senderId } },
    });
    if (!participant) throw new ForbiddenException('Not a participant in this conversation');

    const message = await this.prisma.message.create({
      data: { conversationId, senderId, content },
      include: { sender: { select: { id: true, name: true, avatarUrl: true, role: true } } },
    });

    // Update conversation lastMessage + unread counts for others
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessage: content, lastMessageAt: new Date() },
    });
    await this.prisma.conversationParticipant.updateMany({
      where: { conversationId, userId: { not: senderId } },
      data: { unreadCount: { increment: 1 } },
    });

    // Notify connected clients via Socket.IO
    this.gateway.notifyNewMessage(conversationId, message);

    // Log Activity
    this.activityService.logEvent({
      userId: senderId,
      action: 'MESSAGE_SENT',
      resource: 'Conversation',
      resourceId: conversationId,
    });

    return message;
  }

  async getTotalUnread(userId: string) {
    const result = await this.prisma.conversationParticipant.aggregate({
      where: { userId },
      _sum: { unreadCount: true },
    });
    return result._sum.unreadCount || 0;
  }
}
