import type { SessionUser } from "@/lib/domain/auth/types";
import { buildQuestionOptions } from "@/lib/domain/assessments/build-options";
import { parseExcelQuestions } from "@/lib/domain/assessments/parse-excel-questions";
import {
  AssessmentErrorCode,
  assessmentFailure,
  assessmentSuccess,
  type AssessmentResult,
} from "@/lib/domain/assessments/errors";
import {
  bulkCreateQuestions,
  findAssessmentById,
  getNextQuestionOrder,
  type QuestionRecord,
} from "@/lib/infrastructure/db/repositories/assessment-repository";
import { assessmentIdSchema } from "@/lib/validations/assessment-schemas";

import { assertAssessmentTrainerOrAdmin } from "./assert-access";

export async function importQuestionsUseCase(
  actor: SessionUser | null,
  assessmentId: string,
  fileBuffer: ArrayBuffer,
): Promise<AssessmentResult<QuestionRecord[]>> {
  const forbidden = assertAssessmentTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = assessmentIdSchema.safeParse({ assessmentId });
  if (!parsed.success) {
    return assessmentFailure(AssessmentErrorCode.VALIDATION_ERROR);
  }

  const assessment = await findAssessmentById(assessmentId);
  if (!assessment) {
    return assessmentFailure(AssessmentErrorCode.ASSESSMENT_NOT_FOUND);
  }

  let parsedQuestions;
  try {
    parsedQuestions = parseExcelQuestions(fileBuffer);
  } catch {
    return assessmentFailure(AssessmentErrorCode.IMPORT_ERROR);
  }

  const startOrder = await getNextQuestionOrder(assessmentId);
  const questions = await bulkCreateQuestions(
    parsedQuestions.map((question, index) => ({
      assessmentId,
      questionText: question.questionText,
      options: buildQuestionOptions(question.options),
      order: startOrder + index,
    })),
  );

  return assessmentSuccess(questions);
}
