import type { SessionUser } from "@/lib/domain/auth/types";
import { canRetry } from "@/lib/domain/assessments/can-retry";
import {
  AssessmentErrorCode,
  assessmentFailure,
  assessmentSuccess,
  type AssessmentResult,
} from "@/lib/domain/assessments/errors";
import { getBestScore, hasPassed } from "@/lib/domain/assessments/best-score";
import { resolvePassingGrade } from "@/lib/domain/assessments/resolve-passing-grade";
import {
  findAssessmentByModuleAndType,
  findInProgressAttempt,
  findModuleContextById,
  getBestSubmittedScore,
  getTrainingPassingGrade,
  listQuestionsByAssessment,
  listSubmittedAttempts,
  type AssessmentAttemptRecord,
  type AssessmentRecord,
  type QuestionRecord,
} from "@/lib/infrastructure/db/repositories/assessment-repository";
import { isStudentEnrolledInTraining } from "@/lib/infrastructure/db/repositories/module-repository";
import { moduleAssessmentSchema } from "@/lib/validations/assessment-schemas";

import { assertAssessmentStudent } from "./assert-access";
import { buildAttemptQuestionSet } from "./attempt-questions";

export type StudentAssessmentState = {
  module: {
    id: string;
    trainingId: string;
    title: string;
  };
  assessment: AssessmentRecord;
  questions: QuestionRecord[];
  passingGrade: number;
  bestScore: number;
  hasPassed: boolean;
  canRetry: boolean;
  inProgressAttempt: AssessmentAttemptRecord | null;
  attempts: AssessmentAttemptRecord[];
};

export async function getStudentAssessmentState(
  actor: SessionUser | null,
  input: unknown,
): Promise<AssessmentResult<StudentAssessmentState>> {
  const forbidden = assertAssessmentStudent(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = moduleAssessmentSchema.safeParse(input);
  if (!parsed.success) {
    return assessmentFailure(AssessmentErrorCode.VALIDATION_ERROR);
  }

  const module = await findModuleContextById(parsed.data.moduleId);
  if (!module) {
    return assessmentFailure(AssessmentErrorCode.MODULE_NOT_FOUND);
  }

  const enrolled = await isStudentEnrolledInTraining(
    actor!.id,
    module.trainingId,
  );
  if (!enrolled) {
    return assessmentFailure(AssessmentErrorCode.NOT_ENROLLED);
  }

  const assessment = await findAssessmentByModuleAndType(
    parsed.data.moduleId,
    parsed.data.type,
  );
  if (!assessment) {
    return assessmentFailure(AssessmentErrorCode.ASSESSMENT_NOT_FOUND);
  }

  const [questions, attempts, inProgressAttempt, trainingPassingGrade] =
    await Promise.all([
      listQuestionsByAssessment(assessment.id),
      listSubmittedAttempts(actor!.id, assessment.id),
      findInProgressAttempt(actor!.id, assessment.id),
      getTrainingPassingGrade(module.trainingId),
    ]);

  const passingGrade = resolvePassingGrade({
    type: parsed.data.type,
    assessmentPassingGrade: assessment.passingGrade,
    minQuizScore: module.minQuizScore,
    minLatihanScore: module.minLatihanScore,
    trainingPassingGrade,
  });

  const bestScore = getBestScore([
    ...attempts.map((attempt) => attempt.score),
    await getBestSubmittedScore(actor!.id, assessment.id),
  ]);

  const passed = hasPassed(bestScore, passingGrade);
  const retryAllowed = canRetry({
    submittedAttemptCount: attempts.length,
    maxRetry: assessment.maxRetry,
    bestScore,
    passingGrade,
  });

  const displayQuestions = inProgressAttempt
    ? buildAttemptQuestionSet(
        questions,
        assessment,
        inProgressAttempt,
        inProgressAttempt.id,
      )
    : questions;

  return assessmentSuccess({
    module: {
      id: module.id,
      trainingId: module.trainingId,
      title: module.title,
    },
    assessment,
    questions: displayQuestions,
    passingGrade,
    bestScore,
    hasPassed: passed,
    canRetry: retryAllowed,
    inProgressAttempt,
    attempts,
  });
}
