import type { SessionUser } from "@/lib/domain/auth/types";
import {
  CommunityErrorCode,
  communityFailure,
  communitySuccess,
  type CommunityResult,
} from "@/lib/domain/community/errors";
import { canManageMeeting } from "@/lib/domain/community/rules";
import {
  deleteCommunityMeeting,
  findCommunityMeetingById,
} from "@/lib/infrastructure/db/repositories/community-repository";

import {
  assertCommunityEnrollment,
  assertCommunityStudent,
} from "./assert-community-access";

export async function deleteMeeting(
  actor: SessionUser | null,
  meetingId: string,
): Promise<CommunityResult<{ id: string }>> {
  const denied = assertCommunityStudent(actor);
  if (denied) {
    return denied;
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

  const deleted = await deleteCommunityMeeting(meetingId);
  if (!deleted) {
    return communityFailure(CommunityErrorCode.MEETING_NOT_FOUND);
  }

  return communitySuccess({ id: meetingId });
}
