import { hasPassed } from "@/lib/domain/assessments/best-score";
import { getWrongAnswerReviews } from "@/lib/domain/assessments/review-wrong-answers";
import type { WrongAnswerReview } from "@/lib/domain/assessments/review-wrong-answers";
import type {
  AssessmentAttemptRecord,
  AssessmentRecord,
  QuestionRecord,
} from "@/lib/infrastructure/db/repositories/assessment-repository";

import { buildAttemptQuestionSet } from "./attempt-questions";

export type LatestAttemptReview = {
  score: number;
  passingGrade: number;
  passed: boolean;
  bestScore: number;
  wrongAnswers: WrongAnswerReview[];
};

export function buildLatestAttemptReview(
  allQuestions: QuestionRecord[],
  assessment: AssessmentRecord,
  latestSubmittedAttempt: AssessmentAttemptRecord | null,
  passingGrade: number,
  bestScore: number,
): LatestAttemptReview | null {
  if (!latestSubmittedAttempt) {
    return null;
  }

  const attemptQuestions = buildAttemptQuestionSet(
    allQuestions,
    assessment,
    latestSubmittedAttempt,
    latestSubmittedAttempt.id,
  );

  const wrongAnswers = getWrongAnswerReviews(
    attemptQuestions,
    latestSubmittedAttempt.answers,
  );

  return {
    score: latestSubmittedAttempt.score,
    passingGrade,
    passed: hasPassed(latestSubmittedAttempt.score, passingGrade),
    bestScore,
    wrongAnswers,
  };
}
