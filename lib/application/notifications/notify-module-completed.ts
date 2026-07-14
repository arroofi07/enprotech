import type { SessionUser } from "@/lib/domain/auth/types";
import { buildModuleCompletedNotification } from "@/lib/domain/notifications/build-notifications";
import {
  createNotifications,
  hasNotificationWithDedupKey,
} from "@/lib/infrastructure/db/repositories/notification-repository";
import { findTrainingById } from "@/lib/infrastructure/db/repositories/training-repository";
import { findPublicUserById } from "@/lib/infrastructure/db/repositories/user-repository";

import { resolveStaffRecipients } from "./resolve-staff-recipients";

export async function notifyModuleCompleted(input: {
  studentId: string;
  moduleId: string;
  moduleName: string;
  trainingId: string;
}): Promise<void> {
  const [training, student] = await Promise.all([
    findTrainingById(input.trainingId),
    findPublicUserById(input.studentId),
  ]);

  if (!training || !student) {
    return;
  }

  const payload = buildModuleCompletedNotification({
    studentId: input.studentId,
    studentName: student.name,
    moduleId: input.moduleId,
    moduleName: input.moduleName,
    trainingId: input.trainingId,
    trainingName: training.title,
  });

  const dedupKey = payload.data.dedupKey;
  if (!dedupKey) {
    return;
  }

  const recipientIds = await resolveStaffRecipients(
    training.createdBy,
    input.studentId,
  );

  const items = [];

  for (const userId of recipientIds) {
    const exists = await hasNotificationWithDedupKey(userId, dedupKey);
    if (exists) {
      continue;
    }

    items.push({
      userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      data: payload.data,
    });
  }

  await createNotifications(items);
}
