import type { ModuleErrorCode } from "@/lib/domain/modules/errors";

export function moduleErrorHttpStatus(error: ModuleErrorCode): number {
  switch (error) {
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
    case "NOT_ENROLLED":
    case "PRETEST_REQUIRED":
      return 403;
    case "TRAINING_NOT_FOUND":
    case "MODULE_NOT_FOUND":
    case "CONTENT_NOT_FOUND":
      return 404;
    case "VALIDATION_ERROR":
    case "INVALID_FILE_TYPE":
    case "FILE_TOO_LARGE":
      return 400;
    case "UPLOAD_FAILED":
      return 500;
    default: {
      const _exhaustive: never = error;
      return _exhaustive;
    }
  }
}
