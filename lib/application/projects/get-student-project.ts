import type { SessionUser } from "@/lib/domain/auth/types";
import {
  ProjectErrorCode,
  projectFailure,
  projectSuccess,
  type ProjectResult,
} from "@/lib/domain/projects/errors";
import type { StudentProject } from "@/lib/db/schema/student-projects";
import {
  findProjectByIdForStudent,
  listProjectsByStudent,
  listProjectsByStudentAndTraining,
} from "@/lib/infrastructure/db/repositories/project-repository";

import { assertProjectStudent } from "./assert-access";

export async function listStudentProjectsByTraining(
  actor: SessionUser | null,
  trainingId: string,
): Promise<ProjectResult<StudentProject[]>> {
  const forbidden = assertProjectStudent(actor);
  if (forbidden) {
    return forbidden;
  }

  if (!trainingId) {
    return projectFailure(ProjectErrorCode.VALIDATION_ERROR);
  }

  const projects = await listProjectsByStudentAndTraining(
    actor!.id,
    trainingId,
  );
  return projectSuccess(projects);
}

export async function getStudentProjectById(
  actor: SessionUser | null,
  projectId: string,
): Promise<ProjectResult<StudentProject>> {
  const forbidden = assertProjectStudent(actor);
  if (forbidden) {
    return forbidden;
  }

  if (!projectId) {
    return projectFailure(ProjectErrorCode.VALIDATION_ERROR);
  }

  const project = await findProjectByIdForStudent(projectId, actor!.id);
  if (!project) {
    return projectFailure(ProjectErrorCode.PROJECT_NOT_FOUND);
  }

  return projectSuccess(project);
}

export async function listStudentProjects(
  actor: SessionUser | null,
): Promise<ProjectResult<StudentProject[]>> {
  const forbidden = assertProjectStudent(actor);
  if (forbidden) {
    return forbidden;
  }

  const projects = await listProjectsByStudent(actor!.id);
  return projectSuccess(projects);
}
