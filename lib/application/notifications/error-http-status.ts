import type { NotificationErrorCode } from "@/lib/domain/notifications/errors";

export function notificationErrorHttpStatus(
  error: NotificationErrorCode,
): number {
  switch (error) {
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "NOTIFICATION_NOT_FOUND":
      return 404;
    case "VALIDATION_ERROR":
      return 400;
    default: {
      const _exhaustive: never = error;
      return _exhaustive;
    }
  }
}
