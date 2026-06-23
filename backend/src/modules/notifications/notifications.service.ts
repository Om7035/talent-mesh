import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../database/prisma.service';
import { QUEUE_NAMES } from '../../common/constants/queues.constants';
import { NotificationType } from '@prisma/client';

interface SendNotificationDto {
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.NOTIFICATIONS) private readonly notifQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Sends a notification — stores in DB immediately, and optionally queues for email/push.
   */
  async send(dto: SendNotificationDto): Promise<void> {
    try {
      await this.prisma.notification.create({
        data: {
          userId: dto.userId,
          type: dto.type as NotificationType,
          title: dto.title,
          message: dto.message,
          actionUrl: dto.actionUrl ?? null,
          metadata: (dto.metadata as any) ?? null,
        },
      });

      // Queue for email delivery (email service can be added later)
      await this.notifQueue.add('send-notification', dto, { delay: 1000 });
    } catch (err) {
      // Notifications should never crash the main flow
      this.logger.error(`Failed to send notification: ${err}`);
    }
  }

  async sendBulk(userIds: string[], dto: Omit<SendNotificationDto, 'userId'>): Promise<void> {
    await this.prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        type: dto.type as NotificationType,
        title: dto.title,
        message: dto.message,
        actionUrl: dto.actionUrl ?? null,
        metadata: (dto.metadata as any) ?? null,
      })),
    });
  }

  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return { notifications, total, unreadCount, page, limit };
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
