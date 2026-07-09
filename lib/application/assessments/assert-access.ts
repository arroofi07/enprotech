import type { SessionUser } from "@/lib/domain/auth/types";
import {
  AssessmentErrorCode,
  assessmentFailure,
  type AssessmentFailure,
} from "@/lib/domain/assessments/errors";

export function assertAssessmentTrainerOrAdmin(
  actor: SessionUser | null,
): AssessmentFailure | null {
  if (!actor) {
    return assessmentFailure(AssessmentErrorCode.UNAUTHORIZED);
  }

  if (actor.role !== "admin" && actor.role !== "trainer") {
    return assessmentFailure(AssessmentErrorCode.FORBIDDEN);
  }

  return null;
}

export function assertAssessmentStudent(
  actor: SessionUser | null,
): AssessmentFailure | null {
  if (!actor) {
    return assessmentFailure(AssessmentErrorCode.UNAUTHORIZED);
  }

  if (actor.role !== "student") {
    return assessmentFailure(AssessmentErrorCode.FORBIDDEN);
  }

  return null;
}
