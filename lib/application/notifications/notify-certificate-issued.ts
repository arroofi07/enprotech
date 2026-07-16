import {
  buildCertificateIssuedNotification,
  buildStudentCertificateIssuedNotification,
} from "@/lib/domain/notifications/build-notifications";
import {
  createNotificationIfAbsent,
  createNotifications,
  hasNotificationWithDedupKey,
} from "@/lib/infrastructure/db/repositories/notification-repository";
import { findTrainingById } from "@/lib/infrastructure/db/repositories/training-repository";
import { findPublicUserById } from "@/lib/infrastructure/db/repositories/user-repository";

import { resolveStaffRecipients } from "./resolve-staff-recipients";

export async function notifyCertificateIssued(input: {
  studentId: string;
  trainingId: string;
  certificateId: string;
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
    const studentPayload = buildCertificateIssuedNotification({
      studentId: input.studentId,
      trainingId: input.trainingId,
      trainingName: training.title,
      certificateId: input.certificateId,
    });

    const studentDedup = studentPayload.data.dedupKey;
    if (studentDedup) {
      await createNotificationIfAbsent({
        userId: input.studentId,
        type: studentPayload.type,
        title: studentPayload.title,
        message: studentPayload.message,
        data: studentPayload.data,
      });
    }

    // Notify staff (admins + training creator).
    const staffPayload = buildStudentCertificateIssuedNotification({
      studentId: input.studentId,
      studentName: student.name,
      trainingId: input.trainingId,
      trainingName: training.title,
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
    // Notifications must never break certificate issuance.
  }
}
