import type { ImportErrorCode } from "@/lib/domain/imports/errors";

export function importErrorHttpStatus(error: ImportErrorCode): number {
  switch (error) {
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "VALIDATION_ERROR":
    case "FILE_ERROR":
    case "NO_VALID_ROWS":
      return 400;
    case "ASSESSMENT_NOT_FOUND":
    case "TRAINING_NOT_FOUND":
      return 404;
    default: {
      const _exhaustive: never = error;
      return _exhaustive;
    }
  }
}
