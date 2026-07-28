import type { SessionUser } from "@/lib/domain/auth/types";
import {
  CommunityErrorCode,
  communityFailure,
  communitySuccess,
  communityValidationFailure,
  type CommunityResult,
} from "@/lib/domain/community/errors";
import {
  canManageMeeting,
  isValidMeetLink,
  normalizeMeetingDescription,
  normalizeMeetingTitle,
} from "@/lib/domain/community/rules";
import type { CommunityMeetingDto } from "@/lib/domain/community/types";
import { parseWibDateTimeLocal } from "@/lib/domain/modules/format-video-conference-schedule";
import {
  findCommunityMeetingById,
  updateCommunityMeeting,
} from "@/lib/infrastructure/db/repositories/community-repository";
import { updateCommunityMeetingSchema } from "@/lib/validations/community";

import {
  assertCommunityEnrollment,
  assertCommunityStudent,
} from "./assert-community-access";

export async function updateMeeting(
  actor: SessionUser | null,
  meetingId: string,
  input: unknown,
): Promise<CommunityResult<CommunityMeetingDto>> {
  const denied = assertCommunityStudent(actor);
  if (denied) {
    return denied;
  }

  const parsed = updateCommunityMeetingSchema.safeParse(input);
  if (!parsed.success) {
    return communityValidationFailure(
      parsed.error.issues[0]?.message ?? "Data tidak valid.",
    );
  }

  const existing = await findCommunityMeetingById(meetingId);
  if (!existing) {
    return communityFailure(CommunityErrorCode.MEETING_NOT_FOUND);
  }

  if (
    !canManageMeeting({ actorId: actor!.id, creatorId: existing.creatorId })
  ) {
    return communityFailure(CommunityErrorCode.FORBIDDEN);
  }

  const enrollmentDenied = await assertCommunityEnrollment(
    actor!,
    existing.trainingId,
  );
  if (enrollmentDenied) {
    return enrollmentDenied;
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

  const meeting = await updateCommunityMeeting({
    meetingId,
    title,
    description: normalizeMeetingDescription(parsed.data.description),
    scheduledAt,
    meetLink: parsed.data.meetLink.trim(),
  });

  if (!meeting) {
    return communityFailure(CommunityErrorCode.MEETING_NOT_FOUND);
  }

  return communitySuccess(meeting);
}
