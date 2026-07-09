export type ModuleAssessmentType = "quiz" | "latihan";
export type TrainingAssessmentType = "pre_test" | "post_test";
export type AssessmentType = ModuleAssessmentType | TrainingAssessmentType;

export function isTrainingAssessmentType(
  type: AssessmentType,
): type is TrainingAssessmentType {
  return type === "pre_test" || type === "post_test";
}

export function isModuleAssessmentType(
  type: AssessmentType,
): type is ModuleAssessmentType {
  return type === "quiz" || type === "latihan";
}

export type QuestionOptionInput = {
  text: string;
  isCorrect: boolean;
};

export type ParsedExcelQuestion = {
  questionText: string;
  options: QuestionOptionInput[];
};
