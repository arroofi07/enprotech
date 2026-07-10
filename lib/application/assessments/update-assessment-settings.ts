import type { SessionUser } from "@/lib/domain/auth/types";
import {
  AssessmentErrorCode,
  assessmentFailure,
  assessmentSuccess,
  type AssessmentResult,
} from "@/lib/domain/assessments/errors";
import {
  countQuestionsByAssessment,
  findAssessmentById,
  updateAssessmentSettings,
  type AssessmentRecord,
} from "@/lib/infrastructure/db/repositories/assessment-repository";
import { updateAssessmentSettingsSchema } from "@/lib/validations/assessment-schemas";

import { assertAssessmentTrainerOrAdmin } from "./assert-access";

export async function updateAssessmentSettingsUseCase(
  actor: SessionUser | null,
  input: unknown,
): Promise<AssessmentResult<AssessmentRecord>> {
  const forbidden = assertAssessmentTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = updateAssessmentSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return assessmentFailure(AssessmentErrorCode.VALIDATION_ERROR);
  }

  const assessment = await findAssessmentById(parsed.data.assessmentId);
  if (!assessment) {
    return assessmentFailure(AssessmentErrorCode.ASSESSMENT_NOT_FOUND);
  }

  const totalQuestions = await countQuestionsByAssessment(assessment.id);
  const questionDisplayCount = parsed.data.questionDisplayCount ?? null;

  if (
    questionDisplayCount !== null &&
    (questionDisplayCount < 1 || questionDisplayCount > totalQuestions)
  ) {
    return assessmentFailure(AssessmentErrorCode.VALIDATION_ERROR);
  }

  const updated = await updateAssessmentSettings(assessment.id, {
    questionDisplayCount,
    shuffleQuestions: parsed.data.shuffleQuestions,
  });

  if (!updated) {
    return assessmentFailure(AssessmentErrorCode.ASSESSMENT_NOT_FOUND);
  }

  return assessmentSuccess(updated);
}
