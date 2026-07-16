import type { AssessmentAnswer, QuestionOption } from "@/lib/db/schema/assessments";

import { TARGET_TOTAL_SCORE } from "./question-weight";

export type ScorableQuestion = {
  id: string;
  options: QuestionOption[];
};

/**
 * questionWeight null (assessment yang bobotnya belum diatur) tetap dinilai rata:
 * setiap soal bernilai porsi yang sama dari 100. Bila bobot diisi, tiap jawaban
 * benar bernilai persis sebesar bobot itu — hasilnya di-cap 100 karena trainer
 * boleh menyimpan bobot yang totalnya lewat dari 100.
 */
export function calculateScore(
  questions: ScorableQuestion[],
  answers: AssessmentAnswer[],
  questionWeight: number | null = null,
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

  if (questionWeight === null) {
    return Math.round((correct / questions.length) * TARGET_TOTAL_SCORE);
  }

  return Math.min(TARGET_TOTAL_SCORE, Math.round(correct * questionWeight));
}
