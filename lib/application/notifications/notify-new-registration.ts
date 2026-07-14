import { buildNewRegistrationNotification } from "@/lib/domain/notifications/build-notifications";
import {
  createNotifications,
  listActiveAdminIds,
} from "@/lib/infrastructure/db/repositories/notification-repository";

export async function notifyNewRegistration(input: {
  userName: string;
  email: string;
}): Promise<void> {
  try {
    const adminIds = await listActiveAdminIds();
    if (adminIds.length === 0) {
      return;
    }

    const payload = buildNewRegistrationNotification({
      userName: input.userName,
      email: input.email,
    });

    await createNotifications(
      adminIds.map((userId) => ({
        userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        data: payload.data,
      })),
    );
  } catch {
    // Notifications must never break the registration flow.
  }
}
