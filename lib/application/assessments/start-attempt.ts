import type { SessionUser } from "@/lib/domain/auth/types";
import { canRetry } from "@/lib/domain/assessments/can-retry";
import {
  AssessmentErrorCode,
  assessmentFailure,
  assessmentSuccess,
  type AssessmentResult,
} from "@/lib/domain/assessments/errors";
import { resolvePassingGrade } from "@/lib/domain/assessments/resolve-passing-grade";
import { isTrainingAssessmentType } from "@/lib/domain/assessments/types";
import { canAccessPostTest } from "@/lib/domain/training-flow/gates";
import {
  countSubmittedAttempts,
  createAttempt,
  findAssessmentById,
  findInProgressAttempt,
  findModuleContextById,
  getBestSubmittedScore,
  getTrainingPassingGrade,
  listQuestionsByAssessment,
  type AssessmentAttemptRecord,
  type AssessmentRecord,
} from "@/lib/infrastructure/db/repositories/assessment-repository";
import { isStudentEnrolledInTraining } from "@/lib/infrastructure/db/repositories/module-repository";
import {
  areAllModulesCompleted,
  findTrainingById,
} from "@/lib/infrastructure/db/repositories/training-repository";
import { getQuizScheduleState } from "@/lib/domain/modules/video-conference-access";
import { assessmentIdSchema } from "@/lib/validations/assessment-schemas";

import { assertAssessmentStudent } from "./assert-access";
import {
  canStudentAccessModule,
  isModuleQuizCompleted,
} from "../modules/check-module-access";
import { assertStudentCanAccessModules } from "../training-flow/get-student-training-flow-state";
import {
  buildAttemptQuestionSet,
  getAttemptQuestionIds,
} from "./attempt-questions";

export type StartAttemptResult = {
  attempt: AssessmentAttemptRecord;
  questions: Awaited<ReturnType<typeof listQuestionsByAssessment>>;
};

async function resolvePassingGradeForAssessment(
  assessment: AssessmentRecord,
): Promise<number> {
  const trainingPassingGrade = await getTrainingPassingGrade(assessment.trainingId);

  return resolvePassingGrade({
    type: assessment.type,
    assessmentPassingGrade: assessment.passingGrade,
    trainingPassingGrade,
  });
}

async function assertCanStartTrainingAssessment(
  actor: SessionUser,
  assessment: AssessmentRecord,
): Promise<AssessmentResult<void> | null> {
  const training = await findTrainingById(assessment.trainingId);
  if (!training) {
    return assessmentFailure(AssessmentErrorCode.TRAINING_NOT_FOUND);
  }

  if (assessment.type === "pre_test" && !training.isPretestActive) {
    return assessmentFailure(AssessmentErrorCode.PRETEST_NOT_ACTIVE);
  }

  if (assessment.type === "post_test") {
    const allCompleted = await areAllModulesCompleted(
      actor.id,
      assessment.trainingId,
    );
    if (!canAccessPostTest(allCompleted)) {
      return assessmentFailure(AssessmentErrorCode.POSTTEST_LOCKED);
    }
  }

  return null;
}

export async function startAttempt(
  actor: SessionUser | null,
  input: unknown,
): Promise<AssessmentResult<StartAttemptResult>> {
  const forbidden = assertAssessmentStudent(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = assessmentIdSchema.safeParse(input);
  if (!parsed.success) {
    return assessmentFailure(AssessmentErrorCode.VALIDATION_ERROR);
  }

  const assessment = await findAssessmentById(parsed.data.assessmentId);
  if (!assessment) {
    return assessmentFailure(AssessmentErrorCode.ASSESSMENT_NOT_FOUND);
  }

  const enrolled = await isStudentEnrolledInTraining(
    actor!.id,
    assessment.trainingId,
  );
  if (!enrolled) {
    return assessmentFailure(AssessmentErrorCode.NOT_ENROLLED);
  }

  if (isTrainingAssessmentType(assessment.type)) {
    const trainingGate = await assertCanStartTrainingAssessment(actor!, assessment);
    if (trainingGate && !trainingGate.success) {
      return trainingGate;
    }
  } else if (!assessment.moduleId) {
    return assessmentFailure(AssessmentErrorCode.ASSESSMENT_NOT_FOUND);
  } else {
    const pretestPassed = await assertStudentCanAccessModules(
      actor!,
      assessment.trainingId,
    );
    if (!pretestPassed) {
      return assessmentFailure(AssessmentErrorCode.PRETEST_REQUIRED);
    }

    const canAccess = await canStudentAccessModule(
      actor!.id,
      assessment.trainingId,
      assessment.moduleId,
    );
    if (!canAccess) {
      return assessmentFailure(AssessmentErrorCode.MODULE_LOCKED);
    }

    if (assessment.type === "quiz") {
      const moduleContext = await findModuleContextById(assessment.moduleId);
      const scheduleState = getQuizScheduleState(
        moduleContext?.videoConferenceScheduledAt ?? null,
        new Date(),
      );
      if (scheduleState === "not_scheduled") {
        return assessmentFailure(AssessmentErrorCode.QUIZ_NOT_SCHEDULED);
      }
      if (scheduleState === "locked") {
        return assessmentFailure(AssessmentErrorCode.QUIZ_NOT_STARTED);
      }
    } else if (assessment.type === "latihan") {
      const quizCompleted = await isModuleQuizCompleted(
        actor!.id,
        assessment.moduleId,
      );
      if (!quizCompleted) {
        return assessmentFailure(AssessmentErrorCode.LATIHAN_LOCKED);
      }
    }
  }

  const questions = await listQuestionsByAssessment(assessment.id);
  if (questions.length === 0) {
    return assessmentFailure(AssessmentErrorCode.NO_QUESTIONS);
  }

  const passingGrade = await resolvePassingGradeForAssessment(assessment);
  const bestScore = await getBestSubmittedScore(actor!.id, assessment.id);
  const submittedAttemptCount = await countSubmittedAttempts(
    actor!.id,
    assessment.id,
  );

  if (
    !canRetry({
      submittedAttemptCount,
      maxRetry: assessment.maxRetry,
      bestScore,
      passingGrade,
    })
  ) {
    if (
      assessment.type === "pre_test" &&
      submittedAttemptCount >= (assessment.maxRetry ?? 1)
    ) {
      return assessmentFailure(AssessmentErrorCode.PRETEST_ALREADY_ATTEMPTED);
    }

    return assessmentFailure(AssessmentErrorCode.ALREADY_PASSED);
  }

  const existingAttempt = await findInProgressAttempt(
    actor!.id,
    assessment.id,
  );
  if (existingAttempt) {
    const attemptQuestions = buildAttemptQuestionSet(
      questions,
      assessment,
      existingAttempt,
      existingAttempt.id,
    );

    return assessmentSuccess({
      attempt: existingAttempt,
      questions: attemptQuestions,
    });
  }

  const preparedQuestions = buildAttemptQuestionSet(
    questions,
    assessment,
    null,
    crypto.randomUUID(),
  );

  const attempt = await createAttempt({
    studentId: actor!.id,
    assessmentId: assessment.id,
    questionIds: getAttemptQuestionIds(preparedQuestions),
  });

  return assessmentSuccess({ attempt, questions: preparedQuestions });
}
