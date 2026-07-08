import type { SessionUser } from "@/lib/domain/auth/types";
import {
  UserErrorCode,
  userFailure,
  userSuccess,
  type UserResult,
} from "@/lib/domain/users/errors";
import {
  findPublicUserById,
  type PublicUserRecord,
} from "@/lib/infrastructure/db/repositories/user-repository";
import {
  getUserSchema,
  type GetUserInput,
} from "@/lib/validations/user-schemas";

import { assertAdmin } from "./assert-admin";

export async function getUser(
  actor: SessionUser | null,
  input: GetUserInput,
): Promise<UserResult<PublicUserRecord>> {
  const forbidden = assertAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = getUserSchema.safeParse(input);
  if (!parsed.success) {
    return userFailure(UserErrorCode.VALIDATION_ERROR);
  }

  const user = await findPublicUserById(parsed.data.userId);
  if (!user) {
    return userFailure(UserErrorCode.USER_NOT_FOUND);
  }

  return userSuccess(user);
}
