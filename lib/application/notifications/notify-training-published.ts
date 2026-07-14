import { buildTrainingPublishedNotification } from "@/lib/domain/notifications/build-notifications";
import {
  createNotifications,
  hasNotificationWithDedupKey,
} from "@/lib/infrastructure/db/repositories/notification-repository";
import {
  findTrainingById,
  listEnrollmentsByTraining,
} from "@/lib/infrastructure/db/repositories/training-repository";

export async function notifyTrainingPublished(input: {
  trainingId: string;
}): Promise<void> {
  try {
    const training = await findTrainingById(input.trainingId);
    if (!training) {
      return;
    }

    const enrollments = await listEnrollmentsByTraining(input.trainingId);
    if (enrollments.length === 0) {
      return;
    }

    const payload = buildTrainingPublishedNotification({
      trainingId: input.trainingId,
      trainingName: training.title,
    });

    const dedupKey = payload.data.dedupKey;
    if (!dedupKey) {
      return;
    }

    const items = [];
    for (const enrollment of enrollments) {
      if (await hasNotificationWithDedupKey(enrollment.studentId, dedupKey)) {
        continue;
      }
      items.push({
        userId: enrollment.studentId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        data: payload.data,
      });
    }

    await createNotifications(items);
  } catch {
    // Notifications must never break the pre-test activation flow.
  }
}
