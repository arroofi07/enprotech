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

import { getQuizScheduleState } from "@/lib/domain/modules/video-conference-access";

import { assertAssessmentStudent } from "./assert-access";
import {
  canStudentAccessModule,
  isModuleQuizCompleted,
} from "../modules/check-module-access";
import { assertStudentCanAccessModules } from "../training-flow/get-student-training-flow-state";
import { buildAttemptQuestionSet } from "./attempt-questions";
import {
  buildLatestAttemptReview,
  type LatestAttemptReview,
} from "./build-latest-attempt-review";

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
  latestAttemptReview: LatestAttemptReview | null;
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

  const pretestPassed = await assertStudentCanAccessModules(
    actor!,
    module.trainingId,
  );
  if (!pretestPassed) {
    return assessmentFailure(AssessmentErrorCode.PRETEST_REQUIRED);
  }

  const canAccess = await canStudentAccessModule(
    actor!.id,
    module.trainingId,
    parsed.data.moduleId,
  );
  if (!canAccess) {
    return assessmentFailure(AssessmentErrorCode.MODULE_LOCKED);
  }

  if (parsed.data.type === "quiz") {
    const scheduleState = getQuizScheduleState(
      module.videoConferenceScheduledAt,
      new Date(),
    );
    if (scheduleState === "not_scheduled") {
      return assessmentFailure(AssessmentErrorCode.QUIZ_NOT_SCHEDULED);
    }
    if (scheduleState === "locked") {
      return assessmentFailure(AssessmentErrorCode.QUIZ_NOT_STARTED);
    }
  } else if (parsed.data.type === "latihan") {
    const quizCompleted = await isModuleQuizCompleted(
      actor!.id,
      parsed.data.moduleId,
    );
    if (!quizCompleted) {
      return assessmentFailure(AssessmentErrorCode.LATIHAN_LOCKED);
    }
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

  const latestAttemptReview = inProgressAttempt
    ? null
    : buildLatestAttemptReview(
        questions,
        assessment,
        attempts[0] ?? null,
        passingGrade,
        bestScore,
      );

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
    latestAttemptReview,
  });
}
