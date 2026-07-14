import { buildAccountDeactivatedNotification } from "@/lib/domain/notifications/build-notifications";
import { createNotification } from "@/lib/infrastructure/db/repositories/notification-repository";

export async function notifyAccountDeactivated(input: {
  userId: string;
}): Promise<void> {
  try {
    const payload = buildAccountDeactivatedNotification();

    await createNotification({
      userId: input.userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      data: payload.data,
    });
  } catch {
    // Notifications must never break the status update flow.
  }
}
