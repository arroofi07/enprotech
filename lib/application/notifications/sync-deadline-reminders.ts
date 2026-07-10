import type { SessionUser } from "@/lib/domain/auth/types";
import {
  buildDeadlineReminderNotification,
  getDeadlineReminderDays,
} from "@/lib/domain/notifications/build-notifications";
import {
  createNotification,
  hasNotificationWithDedupKey,
} from "@/lib/infrastructure/db/repositories/notification-repository";
import { listEnrolledTrainingsByStudent } from "@/lib/infrastructure/db/repositories/training-repository";

export async function syncDeadlineRemindersForStudent(
  studentId: string,
): Promise<number> {
  const { items: trainings } = await listEnrolledTrainingsByStudent(studentId, {
    page: 1,
    pageSize: 100,
  });
  let created = 0;

  for (const training of trainings) {
    if (!training.deadline) {
      continue;
    }

    const reminderDays = getDeadlineReminderDays(training.deadline);
    for (const reminderDay of reminderDays) {
      const payload = buildDeadlineReminderNotification({
        trainingId: training.id,
        trainingName: training.title,
        deadline: training.deadline,
        reminderDay,
      });

      const dedupKey = payload.data.dedupKey;
      if (!dedupKey) {
        continue;
      }

      const exists = await hasNotificationWithDedupKey(studentId, dedupKey);
      if (exists) {
        continue;
      }

      await createNotification({
        userId: studentId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        data: payload.data,
      });
      created += 1;
    }
  }

  return created;
}

export async function syncDeadlineRemindersForActor(
  actor: SessionUser,
): Promise<number> {
  if (actor.role !== "student") {
    return 0;
  }

  return syncDeadlineRemindersForStudent(actor.id);
}
