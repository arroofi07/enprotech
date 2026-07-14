import type { SessionUser } from "@/lib/domain/auth/types";
import {
  UserErrorCode,
  userFailure,
  userSuccess,
  type UserResult,
} from "@/lib/domain/users/errors";
import {
  countActiveAdmins,
  findPublicUserById,
  updateUserRole as updateUserRoleInRepo,
  type PublicUserRecord,
} from "@/lib/infrastructure/db/repositories/user-repository";
import {
  updateUserRoleSchema,
  type UpdateUserRoleInput,
} from "@/lib/validations/user-schemas";

import { notifyRoleChanged } from "@/lib/application/notifications/notify-role-changed";

import { assertAdmin } from "./assert-admin";

export async function updateUserRole(
  actor: SessionUser | null,
  input: UpdateUserRoleInput,
): Promise<UserResult<PublicUserRecord>> {
  const forbidden = assertAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = updateUserRoleSchema.safeParse(input);
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

  if (
    existing.role === "admin" &&
    existing.status === "active" &&
    parsed.data.role !== "admin"
  ) {
    const activeAdmins = await countActiveAdmins();
    if (activeAdmins <= 1) {
      return userFailure(UserErrorCode.LAST_ADMIN_PROTECTED);
    }
  }

  const updated = await updateUserRoleInRepo(
    parsed.data.userId,
    parsed.data.role,
  );
  if (!updated) {
    return userFailure(UserErrorCode.USER_NOT_FOUND);
  }

  if (existing.role !== parsed.data.role) {
    await notifyRoleChanged({
      userId: parsed.data.userId,
      role: parsed.data.role,
    });
  }

  return userSuccess(updated);
}
