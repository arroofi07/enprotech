import type { SessionUser } from "@/lib/domain/auth/types";
import {
  UserErrorCode,
  userFailure,
  type UserFailure,
} from "@/lib/domain/users/errors";

export function assertAdmin(
  actor: SessionUser | null,
): UserFailure | null {
  if (!actor) {
    return userFailure(UserErrorCode.UNAUTHORIZED);
  }

  if (actor.role !== "admin") {
    return userFailure(UserErrorCode.FORBIDDEN);
  }

  return null;
}
