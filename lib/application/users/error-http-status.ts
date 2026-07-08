import type { UserErrorCode } from "@/lib/domain/users/errors";

export function userErrorHttpStatus(error: UserErrorCode): number {
  switch (error) {
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "USER_NOT_FOUND":
      return 404;
    case "VALIDATION_ERROR":
      return 400;
    case "INVALID_STATUS_TRANSITION":
    case "CANNOT_MODIFY_SELF":
    case "LAST_ADMIN_PROTECTED":
      return 409;
    default: {
      const _exhaustive: never = error;
      return _exhaustive;
    }
  }
}
