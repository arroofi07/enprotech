import type { QuestionOption } from "@/lib/db/schema/assessments";

import type { QuestionOptionInput } from "./types";

export function buildQuestionOptions(
  inputs: QuestionOptionInput[],
): QuestionOption[] {
  return inputs.map((input) => ({
    id: crypto.randomUUID(),
    text: input.text.trim(),
    isCorrect: input.isCorrect,
  }));
}
