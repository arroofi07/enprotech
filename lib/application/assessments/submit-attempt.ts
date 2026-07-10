import type { SessionUser } from "@/lib/domain/auth/types";
import { calculateScore } from "@/lib/domain/assessments/calculate-score";
import { getBestScore, hasPassed } from "@/lib/domain/assessments/best-score";
import {
  AssessmentErrorCode,
  assessmentFailure,
  assessmentSuccess,
  type AssessmentResult,
} from "@/lib/domain/assessments/errors";
import { getWrongAnswerReviews } from "@/lib/domain/assessments/review-wrong-answers";
import { resolvePassingGrade } from "@/lib/domain/assessments/resolve-passing-grade";
import { isTrainingAssessmentType } from "@/lib/domain/assessments/types";
import {
  findAssessmentById,
  findAttemptById,
  findModuleContextById,
  getBestSubmittedScore,
  getTrainingPassingGrade,
  listQuestionsByAssessment,
  listSubmittedAttempts,
  submitAttempt,
  type AssessmentRecord,
} from "@/lib/infrastructure/db/repositories/assessment-repository";

import { assertAssessmentStudent } from "./assert-access";
import { issueCertificateIfEligible } from "../certificates/issue-certificate-if-eligible";
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

  if (isTrainingAssessmentType(assessment.type)) {
    return resolvePassingGrade({
      type: assessment.type,
      assessmentPassingGrade: assessment.passingGrade,
      trainingPassingGrade,
    });
  }

  if (!assessment.moduleId) {
    return trainingPassingGrade;
  }

  const module = await findModuleContextById(assessment.moduleId);
  if (!module) {
    return trainingPassingGrade;
  }

  return resolvePassingGrade({
    type: assessment.type,
    assessmentPassingGrade: assessment.passingGrade,
    minQuizScore: module.minQuizScore,
    minLatihanScore: module.minLatihanScore,
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

  const score = calculateScore(questions, attempt.answers);
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

  if (
    assessment.type === "post_test" &&
    hasPassed(bestScore, passingGrade)
  ) {
    await issueCertificateIfEligible({
      studentId: actor!.id,
      trainingId: assessment.trainingId,
    });
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
