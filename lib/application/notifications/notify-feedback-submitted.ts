import { buildFeedbackSubmittedNotification } from "@/lib/domain/notifications/build-notifications";
import { createNotifications } from "@/lib/infrastructure/db/repositories/notification-repository";
import { findTrainingById } from "@/lib/infrastructure/db/repositories/training-repository";
import { findPublicUserById } from "@/lib/infrastructure/db/repositories/user-repository";

import { resolveStaffRecipients } from "./resolve-staff-recipients";

export async function notifyFeedbackSubmitted(input: {
  studentId: string;
  trainingId: string;
}): Promise<void> {
  try {
    const [training, student] = await Promise.all([
      findTrainingById(input.trainingId),
      findPublicUserById(input.studentId),
    ]);

    if (!training || !student) {
      return;
    }

    const payload = buildFeedbackSubmittedNotification({
      studentId: input.studentId,
      studentName: student.name,
      trainingId: input.trainingId,
      trainingName: training.title,
    });

    const recipientIds = await resolveStaffRecipients(
      training.createdBy,
      input.studentId,
    );

    await createNotifications(
      recipientIds.map((userId) => ({
        userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        data: payload.data,
      })),
    );
  } catch {
    // Notifications must never break the feedback submission flow.
  }
}
