import { formatVideoConferenceSchedule } from "@/lib/domain/modules/format-video-conference-schedule";
import { buildCommunityMeetingScheduledNotification } from "@/lib/domain/notifications/build-notifications";
import type { CommunityMeetingDto } from "@/lib/domain/community/types";
import { createNotifications } from "@/lib/infrastructure/db/repositories/notification-repository";
import {
  findTrainingById,
  listEnrollmentsByTraining,
} from "@/lib/infrastructure/db/repositories/training-repository";

export async function notifyCommunityMeetingScheduled(input: {
  meeting: CommunityMeetingDto;
  creatorId: string;
  creatorName: string;
}): Promise<void> {
  try {
    const training = await findTrainingById(input.meeting.trainingId);
    if (!training) {
      return;
    }

    const enrollments = await listEnrollmentsByTraining(
      input.meeting.trainingId,
    );
    const recipientIds = enrollments
      .map((row) => row.studentId)
      .filter((id) => id !== input.creatorId);

    if (recipientIds.length === 0) {
      return;
    }

    const scheduledLabel = formatVideoConferenceSchedule(
      new Date(input.meeting.scheduledAt),
    );

    const payload = buildCommunityMeetingScheduledNotification({
      trainingId: input.meeting.trainingId,
      trainingName: training.title,
      meetingId: input.meeting.id,
      meetingTitle: input.meeting.title,
      creatorName: input.creatorName,
      scheduledAt: input.meeting.scheduledAt,
      scheduledLabel,
    });

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
    // Notifications must never break meeting creation.
  }
}
