import type { TrainingErrorCode } from "@/lib/domain/trainings/errors";

export function trainingErrorHttpStatus(error: TrainingErrorCode): number {
  switch (error) {
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "TRAINING_NOT_FOUND":
    case "ENROLLMENT_NOT_FOUND":
    case "STUDENT_NOT_FOUND":
      return 404;
    case "VALIDATION_ERROR":
      return 400;
    case "INVALID_STATUS_TRANSITION":
    case "ALREADY_ENROLLED":
    case "MODULES_NOT_READY":
    case "PRETEST_ALREADY_ACTIVE":
      return 409;
    default: {
      const _exhaustive: never = error;
      return _exhaustive;
    }
  }
}
