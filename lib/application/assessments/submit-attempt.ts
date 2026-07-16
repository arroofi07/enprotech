import type { SessionUser } from "@/lib/domain/auth/types";
import { areAllQuestionsAnswered } from "@/lib/domain/assessments/are-all-questions-answered";
import { calculateScore } from "@/lib/domain/assessments/calculate-score";
import { getBestScore, hasPassed } from "@/lib/domain/assessments/best-score";
import {
  AssessmentErrorCode,
  assessmentFailure,
  assessmentSuccess,
  type AssessmentResult,
} from "@/lib/domain/assessments/errors";
import { isAttemptTimedOut } from "@/lib/domain/assessments/is-attempt-timed-out";
import { getWrongAnswerReviews } from "@/lib/domain/assessments/review-wrong-answers";
import { resolvePassingGrade } from "@/lib/domain/assessments/resolve-passing-grade";
import { isTrainingAssessmentType } from "@/lib/domain/assessments/types";
import {
  findAssessmentById,
  findAttemptById,
  getBestSubmittedScore,
  getTrainingPassingGrade,
  listQuestionsByAssessment,
  listSubmittedAttempts,
  submitAttempt,
  type AssessmentRecord,
} from "@/lib/infrastructure/db/repositories/assessment-repository";

import { assertAssessmentStudent } from "./assert-access";
import { issueCertificateIfEligible } from "../certificates/issue-certificate-if-eligible";
import { tryAutoCompleteModuleAfterAssessmentSubmit } from "../modules/check-module-access";
import { notifyPostTestResult } from "../notifications/notify-post-test-result";
import { buildAttemptQuestionSet } from "./attempt-questions";

export type SubmitAttemptResult = {
  attemptId: string;
  score: number;
  passingGrade: number;
  passed: boolean;
  bestScore: number;
  wrongAnswers: ReturnType<typeof getWrongAnswerReviews>;
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

export async function submitAttemptUseCase(
  actor: SessionUser | null,
  attemptId: string,
): Promise<AssessmentResult<SubmitAttemptResult>> {
  const forbidden = assertAssessmentStudent(actor);
  if (forbidden) {
    return forbidden;
  }

  const attempt = await findAttemptById(attemptId);
  if (!attempt) {
    return assessmentFailure(AssessmentErrorCode.ATTEMPT_NOT_FOUND);
  }

  if (attempt.studentId !== actor!.id) {
    return assessmentFailure(AssessmentErrorCode.FORBIDDEN);
  }

  if (attempt.submittedAt) {
    return assessmentFailure(AssessmentErrorCode.ATTEMPT_ALREADY_SUBMITTED);
  }

  const assessment = await findAssessmentById(attempt.assessmentId);
  if (!assessment) {
    return assessmentFailure(AssessmentErrorCode.ASSESSMENT_NOT_FOUND);
  }

  if (!isTrainingAssessmentType(assessment.type) && !assessment.moduleId) {
    return assessmentFailure(AssessmentErrorCode.ASSESSMENT_NOT_FOUND);
  }

  const allQuestions = await listQuestionsByAssessment(assessment.id);
  if (allQuestions.length === 0) {
    return assessmentFailure(AssessmentErrorCode.NO_QUESTIONS);
  }

  const questions = buildAttemptQuestionSet(
    allQuestions,
    assessment,
    attempt,
    attempt.id,
  );

  if (questions.length === 0) {
    return assessmentFailure(AssessmentErrorCode.NO_QUESTIONS);
  }

  // Manual submit must be complete. Timed-out attempts can be scored with blanks as wrong.
  if (
    !isAttemptTimedOut(attempt, assessment) &&
    !areAllQuestionsAnswered(questions, attempt.answers)
  ) {
    return assessmentFailure(AssessmentErrorCode.INCOMPLETE_ANSWERS);
  }

  const score = calculateScore(
    questions,
    attempt.answers,
    assessment.questionWeight,
  );
  const submitted = await submitAttempt(attemptId, {
    score,
    answers: attempt.answers,
  });

  if (!submitted) {
    return assessmentFailure(AssessmentErrorCode.ATTEMPT_ALREADY_SUBMITTED);
  }

  const passingGrade = await resolvePassingGradeForAssessment(assessment);

  const previousAttempts = await listSubmittedAttempts(
    actor!.id,
    assessment.id,
  );
  const bestScore = getBestScore([
    ...previousAttempts.map((item) => item.score),
    score,
    await getBestSubmittedScore(actor!.id, assessment.id),
  ]);

  const wrongAnswers = getWrongAnswerReviews(questions, submitted.answers);

  if (assessment.moduleId && (assessment.type === "quiz" || assessment.type === "latihan")) {
    await tryAutoCompleteModuleAfterAssessmentSubmit(
      actor!.id,
      assessment.moduleId,
    );
  }

  if (assessment.type === "post_test") {
    await notifyPostTestResult({
      studentId: actor!.id,
      attemptId: submitted.id,
      trainingId: assessment.trainingId,
      score,
      passingGrade,
      passed: hasPassed(score, passingGrade),
    });

    if (hasPassed(bestScore, passingGrade)) {
      await issueCertificateIfEligible({
        studentId: actor!.id,
        trainingId: assessment.trainingId,
      });
    }
  }

  return assessmentSuccess({
    attemptId: submitted.id,
    score,
    passingGrade,
    passed: hasPassed(score, passingGrade),
    bestScore,
    wrongAnswers,
  });
}
