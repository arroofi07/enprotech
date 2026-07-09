import type { SessionUser } from "@/lib/domain/auth/types";
import {
  AssessmentErrorCode,
  assessmentFailure,
  assessmentSuccess,
  type AssessmentResult,
} from "@/lib/domain/assessments/errors";
import type { TrainingAssessmentType } from "@/lib/domain/assessments/types";
import {
  createTrainingAssessment,
  findAssessmentByTrainingAndType,
  listQuestionsByAssessment,
  type AssessmentRecord,
  type QuestionRecord,
} from "@/lib/infrastructure/db/repositories/assessment-repository";
import { findTrainingById } from "@/lib/infrastructure/db/repositories/training-repository";
import {
  getTrainingAssessmentTitle,
  trainingAssessmentSchema,
} from "@/lib/validations/assessment-schemas";

import { assertAssessmentTrainerOrAdmin } from "./assert-access";

export type TrainingAssessmentWithQuestions = AssessmentRecord & {
  questions: QuestionRecord[];
};

async function getOrCreateTrainingAssessmentRecord(
  trainingId: string,
  type: TrainingAssessmentType,
): Promise<AssessmentResult<AssessmentRecord>> {
  const training = await findTrainingById(trainingId);
  if (!training) {
    return assessmentFailure(AssessmentErrorCode.TRAINING_NOT_FOUND);
  }

  const existing = await findAssessmentByTrainingAndType(trainingId, type);
  if (existing) {
    return assessmentSuccess(existing);
  }

  const assessment = await createTrainingAssessment({
    trainingId,
    type,
    title: getTrainingAssessmentTitle(training.title, type),
  });

  return assessmentSuccess(assessment);
}

export async function getOrCreateTrainingAssessment(
  actor: SessionUser | null,
  input: unknown,
): Promise<AssessmentResult<TrainingAssessmentWithQuestions>> {
  const forbidden = assertAssessmentTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = trainingAssessmentSchema.safeParse(input);
  if (!parsed.success) {
    return assessmentFailure(AssessmentErrorCode.VALIDATION_ERROR);
  }

  const assessmentResult = await getOrCreateTrainingAssessmentRecord(
    parsed.data.trainingId,
    parsed.data.type,
  );
  if (!assessmentResult.success) {
    return assessmentResult;
  }

  const questions = await listQuestionsByAssessment(assessmentResult.data.id);

  return assessmentSuccess({
    ...assessmentResult.data,
    questions,
  });
}
