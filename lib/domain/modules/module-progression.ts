export type ModuleOrderItem = {
  id: string;
  order: number;
};

export type ModuleAssessmentRequirement = {
  submittedCount: number;
  questionCount: number;
};

export function isAssessmentRequirementMet(
  submittedCount: number,
  questionCount: number,
): boolean {
  if (questionCount <= 0) {
    return true;
  }

  return submittedCount > 0;
}

export function isModuleProgressionComplete(input: {
  quiz: ModuleAssessmentRequirement;
  latihan: ModuleAssessmentRequirement;
}): boolean {
  return (
    isAssessmentRequirementMet(
      input.quiz.submittedCount,
      input.quiz.questionCount,
    ) &&
    isAssessmentRequirementMet(
      input.latihan.submittedCount,
      input.latihan.questionCount,
    )
  );
}

export function canAccessModuleByOrder(
  modules: ModuleOrderItem[],
  targetModuleId: string,
  progressionCompleteByModuleId: Record<string, boolean>,
): boolean {
  const orderedModules = [...modules].sort((left, right) => left.order - right.order);
  const targetIndex = orderedModules.findIndex(
    (module) => module.id === targetModuleId,
  );

  if (targetIndex < 0) {
    return false;
  }

  for (let index = 0; index < targetIndex; index += 1) {
    const previousModule = orderedModules[index]!;
    if (!progressionCompleteByModuleId[previousModule.id]) {
      return false;
    }
  }

  return true;
}
