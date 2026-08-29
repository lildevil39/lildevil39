import { Injectable, NotImplementedException } from "@nestjs/common";
import type { NotificationType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  markRead(_userId: string, _id: string) {
    throw new NotImplementedException("notifications.markRead: TODO — ownership check, set readAt");
  }

  markAllRead(_userId: string) {
    throw new NotImplementedException("notifications.markAllRead: TODO — bulk set readAt where readAt is null");
  }

  /** Called by other modules (payments, invitations, jobs) to raise a notification. */
  create(_userId: string, _type: NotificationType, _title: string, _body?: string, _data?: unknown) {
    throw new NotImplementedException("notifications.create: TODO — insert Notification row");
  }
}
