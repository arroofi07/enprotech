import type { ReportErrorCode } from "@/lib/domain/reports/errors";

export function reportErrorHttpStatus(error: ReportErrorCode): number {
  switch (error) {
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "VALIDATION_ERROR":
      return 400;
    case "STUDENT_NOT_FOUND":
    case "TRAINING_NOT_FOUND":
    case "ENROLLMENT_NOT_FOUND":
      return 404;
    default: {
      const _exhaustive: never = error;
      return _exhaustive;
    }
  }
}
