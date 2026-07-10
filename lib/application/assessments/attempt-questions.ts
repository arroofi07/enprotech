import {
  prepareAttemptQuestions,
  resolveAttemptQuestions,
  type AssessmentDisplaySettings,
} from "@/lib/domain/assessments/prepare-attempt-questions";
import type {
  AssessmentAttemptRecord,
  AssessmentRecord,
  QuestionRecord,
} from "@/lib/infrastructure/db/repositories/assessment-repository";

export function getAssessmentDisplaySettings(
  assessment: AssessmentRecord,
): AssessmentDisplaySettings {
  return {
    questionDisplayCount: assessment.questionDisplayCount,
    shuffleQuestions: assessment.shuffleQuestions,
  };
}

export function buildAttemptQuestionSet(
  allQuestions: QuestionRecord[],
  assessment: AssessmentRecord,
  attempt: AssessmentAttemptRecord | null,
  seed: string,
): QuestionRecord[] {
  if (attempt?.questionIds && attempt.questionIds.length > 0) {
    return resolveAttemptQuestions(allQuestions, attempt.questionIds);
  }

  return prepareAttemptQuestions(
    allQuestions,
    getAssessmentDisplaySettings(assessment),
    seed,
  );
}

export function getAttemptQuestionIds(
  questions: QuestionRecord[],
): string[] {
  return questions.map((question) => question.id);
}
