import type { SessionUser } from "@/lib/domain/auth/types";
import {
  communitySuccess,
  type CommunityResult,
} from "@/lib/domain/community/errors";
import type { CommunityMeetingDto } from "@/lib/domain/community/types";
import { listCommunityMeetings } from "@/lib/infrastructure/db/repositories/community-repository";

import {
  assertCommunityEnrollment,
  assertCommunityStudent,
} from "./assert-community-access";

export async function listMeetings(
  actor: SessionUser | null,
  trainingId: string,
): Promise<CommunityResult<CommunityMeetingDto[]>> {
  const denied = assertCommunityStudent(actor);
  if (denied) {
    return denied;
  }

  const enrollmentDenied = await assertCommunityEnrollment(actor!, trainingId);
  if (enrollmentDenied) {
    return enrollmentDenied;
  }

  const meetings = await listCommunityMeetings(trainingId);
  return communitySuccess(meetings);
}
