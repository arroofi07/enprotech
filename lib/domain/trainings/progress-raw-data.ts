import type { AssessmentType } from "@/lib/domain/assessments/types";
import type { ModuleProgressStatus } from "@/lib/domain/modules/types";

export type TrainingProgressTraining = {
  id: string;
  title: string;
  deadline: string | null;
  isPretestActive: boolean;
  passingGrade: number;
};

export type TrainingProgressModuleRow = {
  id: string;
  title: string;
  order: number;
  minQuizScore: number;
  minLatihanScore: number;
  progressStatus: ModuleProgressStatus;
};

export type TrainingProgressAssessmentRow = {
  id: string;
  moduleId: string | null;
  type: AssessmentType;
  passingGrade: number | null;
};

export type TrainingProgressAttemptStats = {
  bestScore: number;
  submittedCount: number;
  hasInProgressAttempt: boolean;
};

export type StudentTrainingProgressRawData = {
  training: TrainingProgressTraining;
  modules: TrainingProgressModuleRow[];
  assessments: TrainingProgressAssessmentRow[];
  attemptStatsByAssessmentId: Map<string, TrainingProgressAttemptStats>;
};

export function findAssessmentForModule(
  assessments: TrainingProgressAssessmentRow[],
  moduleId: string,
  type: "quiz" | "latihan",
): TrainingProgressAssessmentRow | undefined {
  return assessments.find(
    (assessment) => assessment.moduleId === moduleId && assessment.type === type,
  );
}

export function findTrainingAssessment(
  assessments: TrainingProgressAssessmentRow[],
  type: "pre_test" | "post_test",
): TrainingProgressAssessmentRow | undefined {
  return assessments.find(
    (assessment) => assessment.moduleId === null && assessment.type === type,
  );
}

export function getAttemptStats(
  attemptStatsByAssessmentId: Map<string, TrainingProgressAttemptStats>,
  assessmentId: string | undefined,
): TrainingProgressAttemptStats {
  if (!assessmentId) {
    return {
      bestScore: 0,
      submittedCount: 0,
      hasInProgressAttempt: false,
    };
  }

  return (
    attemptStatsByAssessmentId.get(assessmentId) ?? {
      bestScore: 0,
      submittedCount: 0,
      hasInProgressAttempt: false,
    }
  );
}
