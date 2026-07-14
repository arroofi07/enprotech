import type { SessionUser } from "@/lib/domain/auth/types";
import {
  AssessmentErrorCode,
  assessmentFailure,
  assessmentSuccess,
  type AssessmentResult,
} from "@/lib/domain/assessments/errors";
import {
  findAssessmentById,
  updateAssessmentSettings,
  type AssessmentRecord,
} from "@/lib/infrastructure/db/repositories/assessment-repository";
import { updateAssessmentTimeLimitSchema } from "@/lib/validations/assessment-schemas";

import { assertAssessmentTrainerOrAdmin } from "./assert-access";

export async function updateAssessmentTimeLimitUseCase(
  actor: SessionUser | null,
  input: unknown,
): Promise<AssessmentResult<AssessmentRecord>> {
  const forbidden = assertAssessmentTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = updateAssessmentTimeLimitSchema.safeParse(input);
  if (!parsed.success) {
    return assessmentFailure(AssessmentErrorCode.VALIDATION_ERROR);
  }

  const assessment = await findAssessmentById(parsed.data.assessmentId);
  if (!assessment) {
    return assessmentFailure(AssessmentErrorCode.ASSESSMENT_NOT_FOUND);
  }

  const updated = await updateAssessmentSettings(assessment.id, {
    timeLimit: parsed.data.timeLimit,
  });

  if (!updated) {
    return assessmentFailure(AssessmentErrorCode.ASSESSMENT_NOT_FOUND);
  }

  return assessmentSuccess(updated);
}
