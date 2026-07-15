type AnswerableQuestion = {
  id: string;
  options: Array<{ id: string }>;
};

type AssessmentAnswer = {
  questionId: string;
  selectedOptionId: string;
};

export function areAllQuestionsAnswered(
  questions: AnswerableQuestion[],
  answers: AssessmentAnswer[],
): boolean {
  const selectedOptionsByQuestion = new Map(
    answers.map((answer) => [answer.questionId, answer.selectedOptionId]),
  );

  return questions.every((question) => {
    const selectedOptionId = selectedOptionsByQuestion.get(question.id);

    return (
      selectedOptionId !== undefined &&
      question.options.some((option) => option.id === selectedOptionId)
    );
  });
}
