import type { SessionUser } from "@/lib/domain/auth/types";
import {
  CommunityErrorCode,
  communityFailure,
  communitySuccess,
  communityValidationFailure,
  type CommunityResult,
} from "@/lib/domain/community/errors";
import { normalizeMessageBody } from "@/lib/domain/community/rules";
import type { CommunityMessageDto } from "@/lib/domain/community/types";
import { publishCommunityMessage } from "@/lib/infrastructure/community/community-events";
import { insertCommunityMessage } from "@/lib/infrastructure/db/repositories/community-repository";
import { sendCommunityMessageSchema } from "@/lib/validations/community";

import {
  assertCommunityEnrollment,
  assertCommunityStudent,
} from "./assert-community-access";

export async function sendMessage(
  actor: SessionUser | null,
  trainingId: string,
  input: unknown,
): Promise<CommunityResult<CommunityMessageDto>> {
  const denied = assertCommunityStudent(actor);
  if (denied) {
    return denied;
  }

  const parsed = sendCommunityMessageSchema.safeParse(input);
  if (!parsed.success) {
    return communityValidationFailure(
      parsed.error.issues[0]?.message ?? "Data tidak valid.",
    );
  }

  const body = normalizeMessageBody(parsed.data.body);
  if (!body) {
    return communityValidationFailure("Pesan tidak valid.");
  }

  const enrollmentDenied = await assertCommunityEnrollment(actor!, trainingId);
  if (enrollmentDenied) {
    return enrollmentDenied;
  }

  const message = await insertCommunityMessage({
    trainingId,
    authorId: actor!.id,
    body,
  });

  if (!message) {
    return communityFailure(CommunityErrorCode.VALIDATION_ERROR);
  }

  await publishCommunityMessage(message);

  return communitySuccess(message);
}
