import type { SessionUser } from "@/lib/domain/auth/types";
import {
  AssessmentErrorCode,
  assessmentFailure,
  assessmentSuccess,
  type AssessmentResult,
} from "@/lib/domain/assessments/errors";
import {
  findAttemptById,
  updateAttemptAnswers,
  type AssessmentAttemptRecord,
} from "@/lib/infrastructure/db/repositories/assessment-repository";
import { saveAnswersSchema } from "@/lib/validations/assessment-schemas";

import { assertAssessmentStudent } from "./assert-access";

export async function saveAttemptAnswers(
  actor: SessionUser | null,
  attemptId: string,
  input: unknown,
): Promise<AssessmentResult<AssessmentAttemptRecord>> {
  const forbidden = assertAssessmentStudent(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = saveAnswersSchema.safeParse(input);
  if (!parsed.success) {
    return assessmentFailure(AssessmentErrorCode.VALIDATION_ERROR);
  }

  const attempt = await findAttemptById(attemptId);
  if (!attempt) {
    return assessmentFailure(AssessmentErrorCode.ATTEMPT_NOT_FOUND);
  }

  if (attempt.studentId !== actor!.id) {
    return assessmentFailure(AssessmentErrorCode.FORBIDDEN);
  }

  if (attempt.submittedAt) {
    return assessmentFailure(AssessmentErrorCode.ATTEMPT_ALREADY_SUBMITTED);
  }

  const updated = await updateAttemptAnswers(attemptId, parsed.data.answers);
  if (!updated) {
    return assessmentFailure(AssessmentErrorCode.ATTEMPT_ALREADY_SUBMITTED);
  }

  return assessmentSuccess(updated);
}
