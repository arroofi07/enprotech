import type { SessionUser } from "@/lib/domain/auth/types";
import {
  CommunityErrorCode,
  communityFailure,
  type CommunityFailure,
} from "@/lib/domain/community/errors";
import { isStudentEnrolledInTraining } from "@/lib/infrastructure/db/repositories/module-repository";

export function assertCommunityStudent(
  actor: SessionUser | null,
): CommunityFailure | null {
  if (!actor) {
    return communityFailure(CommunityErrorCode.UNAUTHORIZED);
  }

  if (actor.role !== "student" || actor.status !== "active") {
    return communityFailure(CommunityErrorCode.FORBIDDEN);
  }

  return null;
}

export async function assertCommunityEnrollment(
  actor: SessionUser,
  trainingId: string,
): Promise<CommunityFailure | null> {
  const enrolled = await isStudentEnrolledInTraining(actor.id, trainingId);
  if (!enrolled) {
    return communityFailure(CommunityErrorCode.NOT_ENROLLED);
  }
  return null;
}
