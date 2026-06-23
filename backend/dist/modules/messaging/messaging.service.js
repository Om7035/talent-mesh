"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const messaging_gateway_1 = require("./messaging.gateway");
const activity_service_1 = require("../activity/activity.service");
let MessagingService = class MessagingService {
    constructor(prisma, gateway, activityService) {
        this.prisma = prisma;
        this.gateway = gateway;
        this.activityService = activityService;
    }
    async getOrCreateConversation(currentUserId, otherUserId) {
        const otherUser = await this.prisma.user.findUnique({ where: { id: otherUserId }, select: { id: true, name: true, avatarUrl: true, role: true } });
        if (!otherUser)
            throw new common_1.NotFoundException('User not found');
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
        if (existing)
            return existing;
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
    async getMyConversations(userId) {
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
    async getMessages(conversationId, userId, page = 1, limit = 50) {
        const participant = await this.prisma.conversationParticipant.findUnique({
            where: { conversationId_userId: { conversationId, userId } },
        });
        if (!participant)
            throw new common_1.ForbiddenException('Not a participant in this conversation');
        const unreadMessages = await this.prisma.message.findMany({
            where: { conversationId, senderId: { not: userId }, isRead: false },
            select: { id: true },
        });
        if (unreadMessages.length > 0) {
            await this.prisma.message.updateMany({
                where: { id: { in: unreadMessages.map(m => m.id) } },
                data: { isRead: true },
            });
            await this.prisma.conversationParticipant.update({
                where: { conversationId_userId: { conversationId, userId } },
                data: { unreadCount: 0 },
            });
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
    async sendMessage(conversationId, senderId, content) {
        const participant = await this.prisma.conversationParticipant.findUnique({
            where: { conversationId_userId: { conversationId, userId: senderId } },
        });
        if (!participant)
            throw new common_1.ForbiddenException('Not a participant in this conversation');
        const message = await this.prisma.message.create({
            data: { conversationId, senderId, content },
            include: { sender: { select: { id: true, name: true, avatarUrl: true, role: true } } },
        });
        await this.prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessage: content, lastMessageAt: new Date() },
        });
        await this.prisma.conversationParticipant.updateMany({
            where: { conversationId, userId: { not: senderId } },
            data: { unreadCount: { increment: 1 } },
        });
        this.gateway.notifyNewMessage(conversationId, message);
        this.activityService.logEvent({
            userId: senderId,
            action: 'MESSAGE_SENT',
            resource: 'Conversation',
            resourceId: conversationId,
        });
        return message;
    }
    async getTotalUnread(userId) {
        const result = await this.prisma.conversationParticipant.aggregate({
            where: { userId },
            _sum: { unreadCount: true },
        });
        return result._sum.unreadCount || 0;
    }
};
exports.MessagingService = MessagingService;
exports.MessagingService = MessagingService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => messaging_gateway_1.MessagingGateway))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        messaging_gateway_1.MessagingGateway,
        activity_service_1.ActivityService])
], MessagingService);
//# sourceMappingURL=messaging.service.js.map