import { buildRoleChangedNotification } from "@/lib/domain/notifications/build-notifications";
import { createNotification } from "@/lib/infrastructure/db/repositories/notification-repository";

export async function notifyRoleChanged(input: {
  userId: string;
  role: string;
}): Promise<void> {
  try {
    const payload = buildRoleChangedNotification({ role: input.role });

    await createNotification({
      userId: input.userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      data: payload.data,
    });
  } catch {
    // Notifications must never break the role update flow.
  }
}
