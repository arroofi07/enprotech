import { getCurrentUser } from "@/lib/application/auth/get-session";
import {
  NotificationErrorCode,
  notificationFailure,
  notificationSuccess,
  type NotificationResult,
} from "@/lib/domain/notifications/errors";
import {
  countUnreadNotifications,
  listNotificationsByUser,
} from "@/lib/infrastructure/db/repositories/notification-repository";

import { assertAuthenticated, toNotificationView } from "./notification-view";
import { syncDeadlineRemindersForActor } from "./sync-deadline-reminders";

export type NotificationListResult = {
  items: ReturnType<typeof toNotificationView>[];
  unreadCount: number;
};

export async function listNotifications(
  actor: Awaited<ReturnType<typeof getCurrentUser>>,
): Promise<NotificationResult<NotificationListResult>> {
  const forbidden = assertAuthenticated(actor);
  if (forbidden) {
    return forbidden;
  }

  await syncDeadlineRemindersForActor(actor!);

  const [items, unreadCount] = await Promise.all([
    listNotificationsByUser(actor!.id),
    countUnreadNotifications(actor!.id),
  ]);

  return notificationSuccess({
    items: items.map(toNotificationView),
    unreadCount,
  });
}
