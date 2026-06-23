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
var MessagingGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const activity_service_1 = require("../activity/activity.service");
const jsonwebtoken_1 = require("jsonwebtoken");
const config_1 = require("@nestjs/config");
let MessagingGateway = MessagingGateway_1 = class MessagingGateway {
    constructor(prisma, activityService, configService) {
        this.prisma = prisma;
        this.activityService = activityService;
        this.configService = configService;
        this.logger = new common_1.Logger(MessagingGateway_1.name);
        this.connectedUsers = new Map();
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
            if (!token) {
                client.disconnect();
                return;
            }
            const secret = this.configService.get('JWT_SECRET') || '';
            const payload = (0, jsonwebtoken_1.verify)(token, secret);
            const userId = payload.sub;
            client.data.userId = userId;
            this.connectedUsers.set(userId, client.id);
            client.join(userId);
            this.logger.log(`Client connected: ${userId} (${client.id})`);
            this.server.emit('user_online', { userId });
        }
        catch (err) {
            this.logger.warn(`Invalid connection attempt: ${err.message}`);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const userId = client.data.userId;
        if (userId) {
            this.connectedUsers.delete(userId);
            this.logger.log(`Client disconnected: ${userId}`);
            this.server.emit('user_offline', { userId });
        }
    }
    async handleJoinConversation(client, conversationId) {
        const userId = client.data.userId;
        const participant = await this.prisma.conversationParticipant.findUnique({
            where: { conversationId_userId: { conversationId, userId } },
        });
        if (participant) {
            client.join(`conv_${conversationId}`);
            this.logger.debug(`User ${userId} joined conv_${conversationId}`);
        }
    }
    handleTyping(client, conversationId) {
        const userId = client.data.userId;
        client.to(`conv_${conversationId}`).emit('user_typing', { conversationId, userId });
    }
    notifyNewMessage(conversationId, message) {
        this.server.to(`conv_${conversationId}`).emit('new_message', message);
    }
    notifyReadReceipt(conversationId, userId, messageIds) {
        this.server.to(`conv_${conversationId}`).emit('messages_read', { conversationId, userId, messageIds });
    }
};
exports.MessagingGateway = MessagingGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], MessagingGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_conversation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], MessagingGateway.prototype, "handleJoinConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], MessagingGateway.prototype, "handleTyping", null);
exports.MessagingGateway = MessagingGateway = MessagingGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
        namespace: 'chat',
    }),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        activity_service_1.ActivityService,
        config_1.ConfigService])
], MessagingGateway);
//# sourceMappingURL=messaging.gateway.js.map