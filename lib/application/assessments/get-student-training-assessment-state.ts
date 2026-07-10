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
import type { TrainingAssessmentType } from "@/lib/domain/assessments/types";
import {
  canAccessPostTest,
  hasCompletedPretest,
} from "@/lib/domain/training-flow/gates";
import {
  countSubmittedAttempts,
  findAssessmentByTrainingAndType,
  findInProgressAttempt,
  getBestSubmittedScore,
  getTrainingPassingGrade,
  listQuestionsByAssessment,
  listSubmittedAttempts,
  type AssessmentAttemptRecord,
  type AssessmentRecord,
  type QuestionRecord,
} from "@/lib/infrastructure/db/repositories/assessment-repository";
import { isStudentEnrolledInTraining } from "@/lib/infrastructure/db/repositories/module-repository";
import {
  areAllModulesCompleted,
  findTrainingById,
} from "@/lib/infrastructure/db/repositories/training-repository";
import { trainingAssessmentSchema } from "@/lib/validations/assessment-schemas";

import { assertAssessmentStudent } from "./assert-access";
import { buildAttemptQuestionSet } from "./attempt-questions";

export type StudentTrainingAssessmentState = {
  training: {
    id: string;
    title: string;
    isPretestActive: boolean;
  };
  assessment: AssessmentRecord;
  questions: QuestionRecord[];
  passingGrade: number;
  bestScore: number;
  hasPassed: boolean;
  canRetry: boolean;
  hasCompleted: boolean;
  inProgressAttempt: AssessmentAttemptRecord | null;
  attempts: AssessmentAttemptRecord[];
  allModulesCompleted: boolean;
};

export async function getStudentTrainingAssessmentState(
  actor: SessionUser | null,
  input: unknown,
): Promise<AssessmentResult<StudentTrainingAssessmentState>> {
  const forbidden = assertAssessmentStudent(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = trainingAssessmentSchema.safeParse(input);
  if (!parsed.success) {
    return assessmentFailure(AssessmentErrorCode.VALIDATION_ERROR);
  }

  const training = await findTrainingById(parsed.data.trainingId);
  if (!training) {
    return assessmentFailure(AssessmentErrorCode.TRAINING_NOT_FOUND);
  }

  const enrolled = await isStudentEnrolledInTraining(
    actor!.id,
    parsed.data.trainingId,
  );
  if (!enrolled) {
    return assessmentFailure(AssessmentErrorCode.NOT_ENROLLED);
  }

  if (parsed.data.type === "pre_test" && !training.isPretestActive) {
    return assessmentFailure(AssessmentErrorCode.PRETEST_NOT_ACTIVE);
  }

  const allModulesCompleted = await areAllModulesCompleted(
    actor!.id,
    parsed.data.trainingId,
  );

  if (parsed.data.type === "post_test" && !canAccessPostTest(allModulesCompleted)) {
    return assessmentFailure(AssessmentErrorCode.POSTTEST_LOCKED);
  }

  const assessment = await findAssessmentByTrainingAndType(
    parsed.data.trainingId,
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
      getTrainingPassingGrade(parsed.data.trainingId),
    ]);

  const passingGrade = resolvePassingGrade({
    type: parsed.data.type,
    assessmentPassingGrade: assessment.passingGrade,
    trainingPassingGrade,
  });

  const bestScore = getBestScore([
    ...attempts.map((attempt) => attempt.score),
    await getBestSubmittedScore(actor!.id, assessment.id),
  ]);

  const submittedAttemptCount = await countSubmittedAttempts(
    actor!.id,
    assessment.id,
  );

  const passed = hasPassed(bestScore, passingGrade);
  const completed =
    parsed.data.type === "pre_test"
      ? hasCompletedPretest(submittedAttemptCount)
      : passed;

  const retryAllowed = canRetry({
    submittedAttemptCount,
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
    training: {
      id: training.id,
      title: training.title,
      isPretestActive: training.isPretestActive,
    },
    assessment,
    questions: displayQuestions,
    passingGrade,
    bestScore,
    hasPassed: passed,
    canRetry: retryAllowed,
    hasCompleted: completed,
    inProgressAttempt,
    attempts,
    allModulesCompleted,
  });
}
