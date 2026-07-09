import type { SessionUser } from "@/lib/domain/auth/types";
import {
  NotificationErrorCode,
  notificationFailure,
  notificationSuccess,
  type NotificationResult,
} from "@/lib/domain/notifications/errors";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/infrastructure/db/repositories/notification-repository";
import { updateNotificationsSchema } from "@/lib/validations/notification-schemas";

import { assertAuthenticated, toNotificationView } from "./notification-view";

export async function updateNotifications(
  actor: SessionUser | null,
  input: unknown,
): Promise<
  NotificationResult<
    | ReturnType<typeof toNotificationView>
    | { markedCount: number }
  >
> {
  const forbidden = assertAuthenticated(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = updateNotificationsSchema.safeParse(input);
  if (!parsed.success) {
    return notificationFailure(NotificationErrorCode.VALIDATION_ERROR);
  }

  if ("markAll" in parsed.data) {
    const markedCount = await markAllNotificationsRead(actor!.id);
    return notificationSuccess({ markedCount });
  }

  const updated = await markNotificationRead(
    actor!.id,
    parsed.data.notificationId,
  );
  if (!updated) {
    return notificationFailure(NotificationErrorCode.NOTIFICATION_NOT_FOUND);
  }

  return notificationSuccess(toNotificationView(updated));
}
