import type { AssessmentErrorCode } from "@/lib/domain/assessments/errors";

export function assessmentErrorHttpStatus(error: AssessmentErrorCode): number {
  switch (error) {
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
    case "NOT_ENROLLED":
    case "ALREADY_PASSED":
    case "PRETEST_NOT_ACTIVE":
    case "PRETEST_ALREADY_ATTEMPTED":
    case "POSTTEST_LOCKED":
    case "MODULE_LOCKED":
      return 403;
    case "MODULE_NOT_FOUND":
    case "ASSESSMENT_NOT_FOUND":
    case "QUESTION_NOT_FOUND":
    case "ATTEMPT_NOT_FOUND":
    case "TRAINING_NOT_FOUND":
      return 404;
    case "VALIDATION_ERROR":
    case "NO_QUESTIONS":
    case "ATTEMPT_ALREADY_SUBMITTED":
    case "IMPORT_ERROR":
      return 400;
    default: {
      const _exhaustive: never = error;
      return _exhaustive;
    }
  }
}
