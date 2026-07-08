import type { SessionUser } from "@/lib/domain/auth/types";
import {
  UserErrorCode,
  userFailure,
  userSuccess,
  type UserResult,
} from "@/lib/domain/users/errors";
import { resolveStatusTransition } from "@/lib/domain/users/status-transitions";
import {
  findPublicUserById,
  updateUserStatus,
  type PublicUserRecord,
} from "@/lib/infrastructure/db/repositories/user-repository";
import {
  approveUserSchema,
  type ApproveUserInput,
} from "@/lib/validations/user-schemas";

import { assertAdmin } from "./assert-admin";

export async function approveUser(
  actor: SessionUser | null,
  input: ApproveUserInput,
): Promise<UserResult<PublicUserRecord>> {
  const forbidden = assertAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = approveUserSchema.safeParse(input);
  if (!parsed.success) {
    return userFailure(UserErrorCode.VALIDATION_ERROR);
  }

  if (actor!.id === parsed.data.userId) {
    return userFailure(UserErrorCode.CANNOT_MODIFY_SELF);
  }

  const existing = await findPublicUserById(parsed.data.userId);
  if (!existing) {
    return userFailure(UserErrorCode.USER_NOT_FOUND);
  }

  const transition = resolveStatusTransition("approve", existing.status);
  if (!transition.success) {
    return userFailure(transition.error);
  }

  const updated = await updateUserStatus(
    parsed.data.userId,
    transition.nextStatus,
  );

  if (!updated) {
    return userFailure(UserErrorCode.USER_NOT_FOUND);
  }

  return userSuccess(updated);
}
