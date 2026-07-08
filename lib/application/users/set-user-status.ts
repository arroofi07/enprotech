import type { SessionUser } from "@/lib/domain/auth/types";
import {
  UserErrorCode,
  userFailure,
  userSuccess,
  type UserResult,
} from "@/lib/domain/users/errors";
import { resolveSetStatusTransition } from "@/lib/domain/users/status-transitions";
import {
  countActiveAdmins,
  findPublicUserById,
  updateUserStatus,
  type PublicUserRecord,
} from "@/lib/infrastructure/db/repositories/user-repository";
import {
  setUserStatusSchema,
  type SetUserStatusInput,
} from "@/lib/validations/user-schemas";

import { assertAdmin } from "./assert-admin";

export async function setUserStatus(
  actor: SessionUser | null,
  input: SetUserStatusInput,
): Promise<UserResult<PublicUserRecord>> {
  const forbidden = assertAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = setUserStatusSchema.safeParse(input);
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

  const transition = resolveSetStatusTransition(
    existing.status,
    parsed.data.status,
  );
  if (!transition.success) {
    return userFailure(transition.error);
  }

  if (
    existing.role === "admin" &&
    existing.status === "active" &&
    transition.nextStatus === "inactive"
  ) {
    const activeAdmins = await countActiveAdmins();
    if (activeAdmins <= 1) {
      return userFailure(UserErrorCode.LAST_ADMIN_PROTECTED);
    }
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
