import { buildEnrolledNotification } from "@/lib/domain/notifications/build-notifications";
import { createNotifications } from "@/lib/infrastructure/db/repositories/notification-repository";
import { findTrainingById } from "@/lib/infrastructure/db/repositories/training-repository";

export async function notifyEnrolled(input: {
  studentIds: string[];
  trainingId: string;
}): Promise<void> {
  try {
    if (input.studentIds.length === 0) {
      return;
    }

    const training = await findTrainingById(input.trainingId);
    if (!training) {
      return;
    }

    const payload = buildEnrolledNotification({
      trainingId: input.trainingId,
      trainingName: training.title,
    });

    await createNotifications(
      input.studentIds.map((userId) => ({
        userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        data: payload.data,
      })),
    );
  } catch {
    // Notifications must never break the enrollment flow.
  }
}
