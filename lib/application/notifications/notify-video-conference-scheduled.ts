import { formatVideoConferenceSchedule } from "@/lib/domain/modules/format-video-conference-schedule";
import { buildVideoConferenceScheduledNotification } from "@/lib/domain/notifications/build-notifications";
import {
  createNotifications,
  hasNotificationWithDedupKey,
} from "@/lib/infrastructure/db/repositories/notification-repository";
import { listEnrollmentsByTraining } from "@/lib/infrastructure/db/repositories/training-repository";

export async function notifyVideoConferenceScheduled(input: {
  trainingId: string;
  moduleId: string;
  moduleName: string;
  scheduledAt: Date;
}): Promise<void> {
  try {
    const enrollments = await listEnrollmentsByTraining(input.trainingId);
    if (enrollments.length === 0) {
      return;
    }

    const scheduledIso = input.scheduledAt.toISOString();
    const payload = buildVideoConferenceScheduledNotification({
      trainingId: input.trainingId,
      moduleId: input.moduleId,
      moduleName: input.moduleName,
      scheduledAt: scheduledIso,
      scheduledLabel: formatVideoConferenceSchedule(input.scheduledAt),
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
    // Notifications must never break the video conference update flow.
  }
}
