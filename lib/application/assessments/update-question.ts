import type { SessionUser } from "@/lib/domain/auth/types";
import { buildQuestionOptions } from "@/lib/domain/assessments/build-options";
import {
  AssessmentErrorCode,
  assessmentFailure,
  assessmentSuccess,
  type AssessmentResult,
} from "@/lib/domain/assessments/errors";
import {
  findQuestionById,
  updateQuestion,
  type QuestionRecord,
} from "@/lib/infrastructure/db/repositories/assessment-repository";
import { updateQuestionSchema } from "@/lib/validations/assessment-schemas";

import { assertAssessmentTrainerOrAdmin } from "./assert-access";

export async function updateQuestionUseCase(
  actor: SessionUser | null,
  questionId: string,
  input: unknown,
): Promise<AssessmentResult<QuestionRecord>> {
  const forbidden = assertAssessmentTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = updateQuestionSchema.safeParse(input);
  if (!parsed.success) {
    return assessmentFailure(AssessmentErrorCode.VALIDATION_ERROR);
  }

  const existing = await findQuestionById(questionId);
  if (!existing) {
    return assessmentFailure(AssessmentErrorCode.QUESTION_NOT_FOUND);
  }

  const options = buildQuestionOptions(parsed.data.options);
  const question = await updateQuestion(questionId, {
    questionText: parsed.data.questionText,
    options,
  });

  if (!question) {
    return assessmentFailure(AssessmentErrorCode.QUESTION_NOT_FOUND);
  }

  return assessmentSuccess(question);
}
