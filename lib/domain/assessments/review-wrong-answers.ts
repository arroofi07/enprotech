import type { AssessmentAnswer, QuestionOption } from "@/lib/db/schema/assessments";

export type WrongAnswerReview = {
  questionId: string;
  questionText: string;
  selectedOptionId: string | null;
  selectedOptionText: string | null;
  correctOptionId: string;
  correctOptionText: string;
};

export type ReviewableQuestion = {
  id: string;
  questionText: string;
  options: QuestionOption[];
};

export function getWrongAnswerReviews(
  questions: ReviewableQuestion[],
  answers: AssessmentAnswer[],
): WrongAnswerReview[] {
  const answerMap = new Map(
    answers.map((answer) => [answer.questionId, answer.selectedOptionId]),
  );

  const reviews: WrongAnswerReview[] = [];

  for (const question of questions) {
    const correctOption = question.options.find((option) => option.isCorrect);
    if (!correctOption) {
      continue;
    }

    const selectedOptionId = answerMap.get(question.id) ?? null;
    const selectedOption = selectedOptionId
      ? question.options.find((option) => option.id === selectedOptionId)
      : null;

    if (selectedOption?.isCorrect) {
      continue;
    }

    reviews.push({
      questionId: question.id,
      questionText: question.questionText,
      selectedOptionId,
      selectedOptionText: selectedOption?.text ?? null,
      correctOptionId: correctOption.id,
      correctOptionText: correctOption.text,
    });
  }

  return reviews;
}
