import type { ModuleProgressStatus } from "@/lib/domain/modules/types";

export type AssessmentProgressStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "passed"
  | "locked";

export type AssessmentProgressItem = {
  assessmentId: string | null;
  status: AssessmentProgressStatus;
  bestScore: number | null;
  passingGrade: number;
  hasPassed: boolean;
};

export type ModuleProgressItem = {
  id: string;
  title: string;
  order: number;
  status: ModuleProgressStatus;
  isLocked: boolean;
  quiz: AssessmentProgressItem;
  latihan: AssessmentProgressItem;
};

export type TrainingProgressSummary = {
  totalItems: number;
  completedItems: number;
  progressPercent: number;
  modules: { completed: number; total: number };
  quizzes: { completed: number; total: number };
  latihans: { completed: number; total: number };
  preTest: AssessmentProgressItem;
  postTest: AssessmentProgressItem;
};

export type StudentTrainingProgress = {
  trainingId: string;
  trainingTitle: string;
  deadline: string | null;
  isPretestActive: boolean;
  summary: TrainingProgressSummary;
  modules: ModuleProgressItem[];
};
