import {
  buildPostTestResultNotification,
  buildPostTestResultStaffNotification,
} from "@/lib/domain/notifications/build-notifications";
import {
  createNotification,
  createNotifications,
  hasNotificationWithDedupKey,
} from "@/lib/infrastructure/db/repositories/notification-repository";
import { findTrainingById } from "@/lib/infrastructure/db/repositories/training-repository";
import { findPublicUserById } from "@/lib/infrastructure/db/repositories/user-repository";

import { resolveStaffRecipients } from "./resolve-staff-recipients";

export async function notifyPostTestResult(input: {
  studentId: string;
  attemptId: string;
  trainingId: string;
  score: number;
  passingGrade: number;
  passed: boolean;
}): Promise<void> {
  try {
    const [training, student] = await Promise.all([
      findTrainingById(input.trainingId),
      findPublicUserById(input.studentId),
    ]);

    if (!training || !student) {
      return;
    }

    // Notify the student.
    const studentPayload = buildPostTestResultNotification({
      attemptId: input.attemptId,
      trainingId: input.trainingId,
      trainingName: training.title,
      score: input.score,
      passingGrade: input.passingGrade,
      passed: input.passed,
    });

    const studentDedup = studentPayload.data.dedupKey;
    if (
      studentDedup &&
      !(await hasNotificationWithDedupKey(input.studentId, studentDedup))
    ) {
      await createNotification({
        userId: input.studentId,
        type: studentPayload.type,
        title: studentPayload.title,
        message: studentPayload.message,
        data: studentPayload.data,
      });
    }

    // Notify staff (admins + training creator).
    const staffPayload = buildPostTestResultStaffNotification({
      attemptId: input.attemptId,
      studentId: input.studentId,
      studentName: student.name,
      trainingId: input.trainingId,
      trainingName: training.title,
      score: input.score,
      passed: input.passed,
    });

    const staffDedup = staffPayload.data.dedupKey;
    if (!staffDedup) {
      return;
    }

    const recipientIds = await resolveStaffRecipients(
      training.createdBy,
      input.studentId,
    );

    const items = [];
    for (const userId of recipientIds) {
      if (await hasNotificationWithDedupKey(userId, staffDedup)) {
        continue;
      }
      items.push({
        userId,
        type: staffPayload.type,
        title: staffPayload.title,
        message: staffPayload.message,
        data: staffPayload.data,
      });
    }

    await createNotifications(items);
  } catch {
    // Notifications must never break the assessment submission flow.
  }
}
