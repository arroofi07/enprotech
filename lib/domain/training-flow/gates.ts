import { hasPassed } from "@/lib/domain/assessments/best-score";

export function canAccessModules(input: {
  isPretestActive: boolean;
  hasCompletedPretest: boolean;
}): boolean {
  return input.isPretestActive && input.hasCompletedPretest;
}

export function canAccessPostTest(allModulesCompleted: boolean): boolean {
  return allModulesCompleted;
}

export function canAccessProject(input: {
  allModulesCompleted: boolean;
  hasPassedPostTest: boolean;
}): boolean {
  return input.allModulesCompleted && input.hasPassedPostTest;
}

export function canAccessCertificate(input: {
  allModulesCompleted: boolean;
  hasPassedPostTest: boolean;
  hasSubmittedProject: boolean;
  hasSubmittedFeedback: boolean;
}): boolean {
  return (
    input.allModulesCompleted &&
    input.hasPassedPostTest &&
    input.hasSubmittedProject &&
    input.hasSubmittedFeedback
  );
}

export function hasCompletedPretest(submittedAttemptCount: number): boolean {
  return submittedAttemptCount > 0;
}

export function hasPassedPostTest(
  bestScore: number,
  passingGrade: number,
): boolean {
  return hasPassed(bestScore, passingGrade);
}
