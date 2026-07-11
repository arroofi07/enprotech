import type { AssessmentType } from "./types";

export function resolvePassingGrade(input: {
  type: AssessmentType;
  assessmentPassingGrade: number | null;
  trainingPassingGrade: number;
}): number {
  if (input.assessmentPassingGrade !== null) {
    return input.assessmentPassingGrade;
  }

  return input.trainingPassingGrade;
}
