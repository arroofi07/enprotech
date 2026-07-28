import type { CommunityErrorCode } from "@/lib/domain/community/errors";

export function communityErrorHttpStatus(error: CommunityErrorCode): number {
  switch (error) {
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
    case "NOT_ENROLLED":
      return 403;
    case "TRAINING_NOT_FOUND":
    case "MESSAGE_NOT_FOUND":
    case "MEETING_NOT_FOUND":
      return 404;
    case "VALIDATION_ERROR":
      return 400;
    default:
      return 400;
  }
}
