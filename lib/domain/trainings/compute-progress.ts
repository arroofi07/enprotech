import { hasPassed } from "@/lib/domain/assessments/best-score";
import type { ModuleProgressStatus } from "@/lib/domain/modules/types";

import type {
  AssessmentProgressItem,
  AssessmentProgressStatus,
  ModuleProgressItem,
  StudentTrainingProgress,
  TrainingProgressSummary,
} from "./progress-types";

export type ModuleProgressSnapshot = {
  status: ModuleProgressStatus;
};

export function calculateTrainingProgress(
  totalItems: number,
  completedItems: number,
): number {
  if (totalItems <= 0) {
    return 0;
  }

  const percent = (completedItems / totalItems) * 100;
  return Math.min(100, Math.max(0, Math.round(percent)));
}

export function countCompletedModules(
  progress: ModuleProgressSnapshot[],
): number {
  return progress.filter((item) => item.status === "completed").length;
}

export function resolveAssessmentProgressStatus(input: {
  locked: boolean;
  submittedCount: number;
  hasInProgressAttempt: boolean;
  hasPassed: boolean;
  requirePass: boolean;
}): AssessmentProgressStatus {
  if (input.locked) {
    return "locked";
  }

  if (input.hasPassed) {
    return "passed";
  }

  if (input.hasInProgressAttempt) {
    return "in_progress";
  }

  if (input.submittedCount > 0) {
    return input.requirePass ? "submitted" : "passed";
  }

  return "not_started";
}

export function isAssessmentProgressComplete(
  status: AssessmentProgressStatus,
): boolean {
  return status === "passed";
}

export function isModuleProgressComplete(status: ModuleProgressStatus): boolean {
  return status === "completed";
}

export function buildAssessmentProgressItem(input: {
  assessmentId: string | null;
  bestScore: number | null;
  passingGrade: number;
  submittedCount: number;
  hasInProgressAttempt: boolean;
  locked: boolean;
  requirePass: boolean;
}): AssessmentProgressItem {
  const passed =
    input.bestScore !== null && hasPassed(input.bestScore, input.passingGrade);

  const status = resolveAssessmentProgressStatus({
    locked: input.locked,
    submittedCount: input.submittedCount,
    hasInProgressAttempt: input.hasInProgressAttempt,
    hasPassed: passed,
    requirePass: input.requirePass,
  });

  return {
    assessmentId: input.assessmentId,
    status,
    bestScore: input.submittedCount > 0 ? (input.bestScore ?? 0) : null,
    passingGrade: input.passingGrade,
    hasPassed: passed,
  };
}

export function buildTrainingProgressSummary(input: {
  modules: ModuleProgressItem[];
  preTest: AssessmentProgressItem;
  postTest: AssessmentProgressItem;
}): TrainingProgressSummary {
  const moduleTotal = input.modules.length;
  const moduleCompleted = input.modules.filter((module) =>
    isModuleProgressComplete(module.status),
  ).length;

  const quizTotal = input.modules.length;
  const quizCompleted = input.modules.filter((module) =>
    isAssessmentProgressComplete(module.quiz.status),
  ).length;

  const latihanTotal = input.modules.length;
  const latihanCompleted = input.modules.filter((module) =>
    isAssessmentProgressComplete(module.latihan.status),
  ).length;

  const totalItems = 2 + moduleTotal * 3;
  const completedItems =
    (isAssessmentProgressComplete(input.preTest.status) ? 1 : 0) +
    moduleCompleted +
    quizCompleted +
    latihanCompleted +
    (isAssessmentProgressComplete(input.postTest.status) ? 1 : 0);

  return {
    totalItems,
    completedItems,
    progressPercent: calculateTrainingProgress(totalItems, completedItems),
    modules: { completed: moduleCompleted, total: moduleTotal },
    quizzes: { completed: quizCompleted, total: quizTotal },
    latihans: { completed: latihanCompleted, total: latihanTotal },
    preTest: input.preTest,
    postTest: input.postTest,
  };
}

export function buildStudentTrainingProgress(input: {
  trainingId: string;
  trainingTitle: string;
  deadline: string | null;
  isPretestActive: boolean;
  modules: ModuleProgressItem[];
  preTest: AssessmentProgressItem;
  postTest: AssessmentProgressItem;
}): StudentTrainingProgress {
  return {
    trainingId: input.trainingId,
    trainingTitle: input.trainingTitle,
    deadline: input.deadline,
    isPretestActive: input.isPretestActive,
    summary: buildTrainingProgressSummary({
      modules: input.modules,
      preTest: input.preTest,
      postTest: input.postTest,
    }),
    modules: input.modules,
  };
}
