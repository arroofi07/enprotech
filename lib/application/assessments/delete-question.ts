import type { SessionUser } from "@/lib/domain/auth/types";
import {
  AssessmentErrorCode,
  assessmentFailure,
  assessmentSuccess,
  type AssessmentResult,
} from "@/lib/domain/assessments/errors";
import { deleteQuestion } from "@/lib/infrastructure/db/repositories/assessment-repository";
import { questionIdSchema } from "@/lib/validations/assessment-schemas";

import { assertAssessmentTrainerOrAdmin } from "./assert-access";

export async function deleteQuestionUseCase(
  actor: SessionUser | null,
  input: unknown,
): Promise<AssessmentResult<{ questionId: string }>> {
  const forbidden = assertAssessmentTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = questionIdSchema.safeParse(input);
  if (!parsed.success) {
    return assessmentFailure(AssessmentErrorCode.VALIDATION_ERROR);
  }

  const deleted = await deleteQuestion(parsed.data.questionId);
  if (!deleted) {
    return assessmentFailure(AssessmentErrorCode.QUESTION_NOT_FOUND);
  }

  return assessmentSuccess({ questionId: parsed.data.questionId });
}
