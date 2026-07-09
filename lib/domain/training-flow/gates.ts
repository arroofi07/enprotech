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

export function canAccessCertificate(hasPassedPostTest: boolean): boolean {
  return hasPassedPostTest;
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
