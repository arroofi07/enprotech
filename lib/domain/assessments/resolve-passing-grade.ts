import {
  isModuleAssessmentType,
  type AssessmentType,
} from "./types";

export function resolvePassingGrade(input: {
  type: AssessmentType;
  assessmentPassingGrade: number | null;
  minQuizScore?: number;
  minLatihanScore?: number;
  trainingPassingGrade: number;
}): number {
  if (input.assessmentPassingGrade !== null) {
    return input.assessmentPassingGrade;
  }

  if (!isModuleAssessmentType(input.type)) {
    return input.trainingPassingGrade;
  }

  const moduleMinimum =
    input.type === "quiz"
      ? (input.minQuizScore ?? 0)
      : (input.minLatihanScore ?? 0);

  if (moduleMinimum > 0) {
    return moduleMinimum;
  }

  return input.trainingPassingGrade;
}
