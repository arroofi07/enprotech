import { buildAccountApprovedNotification } from "@/lib/domain/notifications/build-notifications";
import { createNotification } from "@/lib/infrastructure/db/repositories/notification-repository";

export async function notifyAccountApproved(input: {
  userId: string;
}): Promise<void> {
  try {
    const payload = buildAccountApprovedNotification();

    await createNotification({
      userId: input.userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      data: payload.data,
    });
  } catch {
    // Notifications must never break the approval flow.
  }
}
