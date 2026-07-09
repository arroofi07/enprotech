import type { SessionUser } from "@/lib/domain/auth/types";
import {
  NotificationErrorCode,
  notificationFailure,
  notificationSuccess,
  type NotificationResult,
} from "@/lib/domain/notifications/errors";
import type { NotificationRecord } from "@/lib/domain/notifications/types";

export function assertAuthenticated(
  actor: SessionUser | null,
): NotificationResult<never> | null {
  if (!actor) {
    return notificationFailure(NotificationErrorCode.UNAUTHORIZED);
  }

  return null;
}

export function toNotificationView(notification: NotificationRecord) {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    href: notification.data?.href ?? null,
    isRead: notification.isRead,
    createdAt: notification.createdAt.toISOString(),
    data: notification.data,
  };
}
