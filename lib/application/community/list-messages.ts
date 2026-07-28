import type { SessionUser } from "@/lib/domain/auth/types";
import {
  communitySuccess,
  communityValidationFailure,
  type CommunityResult,
} from "@/lib/domain/community/errors";
import type { CommunityMessageDto } from "@/lib/domain/community/types";
import { listCommunityMessages } from "@/lib/infrastructure/db/repositories/community-repository";
import { listCommunityMessagesSchema } from "@/lib/validations/community";

import {
  assertCommunityEnrollment,
  assertCommunityStudent,
} from "./assert-community-access";

export async function listMessages(
  actor: SessionUser | null,
  trainingId: string,
  input: unknown,
): Promise<CommunityResult<CommunityMessageDto[]>> {
  const denied = assertCommunityStudent(actor);
  if (denied) {
    return denied;
  }

  const parsed = listCommunityMessagesSchema.safeParse(input);
  if (!parsed.success) {
    return communityValidationFailure(
      parsed.error.issues[0]?.message ?? "Data tidak valid.",
    );
  }

  const enrollmentDenied = await assertCommunityEnrollment(actor!, trainingId);
  if (enrollmentDenied) {
    return enrollmentDenied;
  }

  const messages = await listCommunityMessages({
    trainingId,
    limit: parsed.data.limit,
    before: parsed.data.before,
    after: parsed.data.after,
  });

  return communitySuccess(messages);
}
