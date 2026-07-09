import type { SessionUser } from "@/lib/domain/auth/types";
import { buildQuestionOptions } from "@/lib/domain/assessments/build-options";
import {
  AssessmentErrorCode,
  assessmentFailure,
  assessmentSuccess,
  type AssessmentResult,
} from "@/lib/domain/assessments/errors";
import {
  createQuestion,
  findAssessmentById,
  getNextQuestionOrder,
  type QuestionRecord,
} from "@/lib/infrastructure/db/repositories/assessment-repository";
import { createQuestionSchema } from "@/lib/validations/assessment-schemas";

import { assertAssessmentTrainerOrAdmin } from "./assert-access";

export async function createQuestionUseCase(
  actor: SessionUser | null,
  input: unknown,
): Promise<AssessmentResult<QuestionRecord>> {
  const forbidden = assertAssessmentTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = createQuestionSchema.safeParse(input);
  if (!parsed.success) {
    return assessmentFailure(AssessmentErrorCode.VALIDATION_ERROR);
  }

  const assessment = await findAssessmentById(parsed.data.assessmentId);
  if (!assessment) {
    return assessmentFailure(AssessmentErrorCode.ASSESSMENT_NOT_FOUND);
  }

  const order = await getNextQuestionOrder(parsed.data.assessmentId);
  const options = buildQuestionOptions(parsed.data.options);

  const question = await createQuestion({
    assessmentId: parsed.data.assessmentId,
    questionText: parsed.data.questionText,
    options,
    order,
  });

  return assessmentSuccess(question);
}
