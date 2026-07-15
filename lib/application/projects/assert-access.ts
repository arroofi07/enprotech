import type { SessionUser } from "@/lib/domain/auth/types";
import {
  ProjectErrorCode,
  projectFailure,
  type ProjectFailure,
} from "@/lib/domain/projects/errors";
import { canAccessProject } from "@/lib/domain/training-flow/gates";
import { isStudentEnrolled } from "@/lib/infrastructure/db/repositories/report-repository";

import { getStudentTrainingFlowState } from "../training-flow/get-student-training-flow-state";

export function assertProjectStudent(
  actor: SessionUser | null,
): ProjectFailure | null {
  if (!actor) {
    return projectFailure(ProjectErrorCode.UNAUTHORIZED);
  }

  if (actor.role !== "student") {
    return projectFailure(ProjectErrorCode.FORBIDDEN);
  }

  return null;
}

export async function assertProjectSubmissionAccess(
  actor: SessionUser | null,
  trainingId: string,
): Promise<ProjectFailure | null> {
  const forbidden = assertProjectStudent(actor);
  if (forbidden) {
    return forbidden;
  }

  const enrolled = await isStudentEnrolled(actor!.id, trainingId);
  if (!enrolled) {
    return projectFailure(ProjectErrorCode.NOT_ENROLLED);
  }

  const flow = await getStudentTrainingFlowState(actor!.id, trainingId);
  if (!flow) {
    return projectFailure(ProjectErrorCode.TRAINING_NOT_FOUND);
  }

  if (
    !canAccessProject({
      allModulesCompleted: flow.allModulesCompleted,
      hasPassedPostTest: flow.hasPassedPostTest,
    })
  ) {
    return projectFailure(ProjectErrorCode.PROJECT_LOCKED);
  }

  return null;
}

export function assertProjectTrainerOrAdmin(
  actor: SessionUser | null,
): ProjectFailure | null {
  if (!actor) {
    return projectFailure(ProjectErrorCode.UNAUTHORIZED);
  }

  if (actor.role !== "admin" && actor.role !== "trainer") {
    return projectFailure(ProjectErrorCode.FORBIDDEN);
  }

  return null;
}
