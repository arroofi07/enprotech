import {
  canAccessModules,
  hasCompletedPretest,
} from "@/lib/domain/training-flow/gates";
import {
  countSubmittedAttempts,
  findAssessmentByTrainingAndType,
  getBestSubmittedScore,
} from "@/lib/infrastructure/db/repositories/assessment-repository";
import { findTrainingById } from "@/lib/infrastructure/db/repositories/training-repository";

export type PretestGateState = {
  isPretestActive: boolean;
  hasCompletedPretest: boolean;
  canAccessModules: boolean;
  pretestBestScore: number | null;
};

export async function getPretestGateState(
  studentId: string,
  trainingId: string,
): Promise<PretestGateState | null> {
  const training = await findTrainingById(trainingId);
  if (!training) {
    return null;
  }

  const pretest = await findAssessmentByTrainingAndType(trainingId, "pre_test");
  let submittedAttemptCount = 0;
  let pretestBestScore: number | null = null;

  if (pretest) {
    submittedAttemptCount = await countSubmittedAttempts(studentId, pretest.id);
    if (submittedAttemptCount > 0) {
      pretestBestScore = await getBestSubmittedScore(studentId, pretest.id);
    }
  }

  const completed = hasCompletedPretest(submittedAttemptCount);

  return {
    isPretestActive: training.isPretestActive,
    hasCompletedPretest: completed,
    canAccessModules: canAccessModules({
      isPretestActive: training.isPretestActive,
      hasCompletedPretest: completed,
    }),
    pretestBestScore,
  };
}
