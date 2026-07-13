import type { SessionUser } from "@/lib/domain/auth/types";
import { getBestScore, hasPassed } from "@/lib/domain/assessments/best-score";
import {
  canAccessCertificate,
  hasPassedPostTest,
} from "@/lib/domain/training-flow/gates";
import {
  findAssessmentByTrainingAndType,
  getBestSubmittedScore,
  getTrainingPassingGrade,
} from "@/lib/infrastructure/db/repositories/assessment-repository";
import { findFeedbackByStudentAndTraining } from "@/lib/infrastructure/db/repositories/feedback-repository";
import { findProjectByStudentAndTraining } from "@/lib/infrastructure/db/repositories/project-repository";
import {
  areAllModulesCompleted,
  findTrainingById,
} from "@/lib/infrastructure/db/repositories/training-repository";

import { getPretestGateState, type PretestGateState } from "./check-pretest-gate";

export type StudentTrainingFlowState = PretestGateState & {
  trainingTitle: string;
  allModulesCompleted: boolean;
  postTestBestScore: number | null;
  hasPassedPostTest: boolean;
  hasSubmittedProject: boolean;
  hasSubmittedFeedback: boolean;
  canAccessCertificate: boolean;
};

export async function getStudentTrainingFlowState(
  studentId: string,
  trainingId: string,
): Promise<StudentTrainingFlowState | null> {
  const training = await findTrainingById(trainingId);
  if (!training) {
    return null;
  }

  const pretestGate = await getPretestGateState(studentId, trainingId);
  if (!pretestGate) {
    return null;
  }

  const [allModulesCompleted, postTest, project, feedback] = await Promise.all([
    areAllModulesCompleted(studentId, trainingId),
    findAssessmentByTrainingAndType(trainingId, "post_test"),
    findProjectByStudentAndTraining(studentId, trainingId),
    findFeedbackByStudentAndTraining(studentId, trainingId),
  ]);

  let postTestBestScore: number | null = null;
  let passedPostTest = false;

  if (postTest) {
    postTestBestScore = await getBestSubmittedScore(studentId, postTest.id);
    const passingGrade = await getTrainingPassingGrade(trainingId);
    passedPostTest = hasPassedPostTest(postTestBestScore, passingGrade);
  }

  const hasSubmittedProject = Boolean(project);
  const hasSubmittedFeedback = Boolean(feedback);

  return {
    ...pretestGate,
    trainingTitle: training.title,
    allModulesCompleted,
    postTestBestScore: postTest ? postTestBestScore : null,
    hasPassedPostTest: passedPostTest,
    hasSubmittedProject,
    hasSubmittedFeedback,
    canAccessCertificate: canAccessCertificate({
      allModulesCompleted,
      hasPassedPostTest: passedPostTest,
      hasSubmittedProject,
      hasSubmittedFeedback,
    }),
  };
}

export async function assertStudentCanAccessModules(
  actor: SessionUser,
  trainingId: string,
): Promise<boolean> {
  const gate = await getPretestGateState(actor.id, trainingId);
  return gate?.canAccessModules ?? false;
}
