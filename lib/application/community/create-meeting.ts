import type { SessionUser } from "@/lib/domain/auth/types";
import {
  CommunityErrorCode,
  communityFailure,
  communitySuccess,
  communityValidationFailure,
  type CommunityResult,
} from "@/lib/domain/community/errors";
import {
  isValidMeetLink,
  normalizeMeetingDescription,
  normalizeMeetingTitle,
} from "@/lib/domain/community/rules";
import type { CommunityMeetingDto } from "@/lib/domain/community/types";
import { parseWibDateTimeLocal } from "@/lib/domain/modules/format-video-conference-schedule";
import { insertCommunityMeeting } from "@/lib/infrastructure/db/repositories/community-repository";
import { createCommunityMeetingSchema } from "@/lib/validations/community";

import {
  assertCommunityEnrollment,
  assertCommunityStudent,
} from "./assert-community-access";
import { notifyCommunityMeetingScheduled } from "./notify-community-meeting";

export async function createMeeting(
  actor: SessionUser | null,
  trainingId: string,
  input: unknown,
): Promise<CommunityResult<CommunityMeetingDto>> {
  const denied = assertCommunityStudent(actor);
  if (denied) {
    return denied;
  }

  const parsed = createCommunityMeetingSchema.safeParse(input);
  if (!parsed.success) {
    return communityValidationFailure(
      parsed.error.issues[0]?.message ?? "Data tidak valid.",
    );
  }

  const title = normalizeMeetingTitle(parsed.data.title);
  if (!title) {
    return communityValidationFailure("Judul tidak valid.");
  }

  if (!isValidMeetLink(parsed.data.meetLink)) {
    return communityValidationFailure("Link meeting tidak valid.");
  }

  const scheduledAt = parseWibDateTimeLocal(parsed.data.scheduledAt);
  if (!scheduledAt) {
    return communityValidationFailure("Format jadwal tidak valid.");
  }

  const enrollmentDenied = await assertCommunityEnrollment(actor!, trainingId);
  if (enrollmentDenied) {
    return enrollmentDenied;
  }

  const meeting = await insertCommunityMeeting({
    trainingId,
    creatorId: actor!.id,
    title,
    description: normalizeMeetingDescription(parsed.data.description),
    scheduledAt,
    meetLink: parsed.data.meetLink.trim(),
  });

  if (!meeting) {
    return communityFailure(CommunityErrorCode.VALIDATION_ERROR);
  }

  await notifyCommunityMeetingScheduled({
    meeting,
    creatorId: actor!.id,
    creatorName: actor!.name,
  });

  return communitySuccess(meeting);
}
