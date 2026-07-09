import type { AssessmentAnswer, QuestionOption } from "@/lib/db/schema/assessments";

export type ScorableQuestion = {
  id: string;
  options: QuestionOption[];
};

export function calculateScore(
  questions: ScorableQuestion[],
  answers: AssessmentAnswer[],
): number {
  if (questions.length === 0) {
    return 0;
  }

  const answerMap = new Map(
    answers.map((answer) => [answer.questionId, answer.selectedOptionId]),
  );

  let correct = 0;

  for (const question of questions) {
    const selectedOptionId = answerMap.get(question.id);
    if (!selectedOptionId) {
      continue;
    }

    const selectedOption = question.options.find(
      (option) => option.id === selectedOptionId,
    );

    if (selectedOption?.isCorrect) {
      correct += 1;
    }
  }

  return Math.round((correct / questions.length) * 100);
}
