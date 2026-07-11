import type { QuestionRecord } from "@/lib/infrastructure/db/repositories/assessment-repository";

export function filterQuestions(
  questions: QuestionRecord[],
  search?: string,
): QuestionRecord[] {
  const term = search?.trim().toLowerCase();

  if (!term) {
    return questions;
  }

  return questions.filter((question) => {
    if (question.questionText.toLowerCase().includes(term)) {
      return true;
    }

    return question.options.some((option) =>
      option.text.toLowerCase().includes(term),
    );
  });
}
