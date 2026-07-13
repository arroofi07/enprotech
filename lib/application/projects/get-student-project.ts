import type { SessionUser } from "@/lib/domain/auth/types";
import {
  ProjectErrorCode,
  projectFailure,
  projectSuccess,
  type ProjectResult,
} from "@/lib/domain/projects/errors";
import type { StudentProject } from "@/lib/db/schema/student-projects";
import {
  findProjectByStudentAndTraining,
  listProjectsByStudent,
} from "@/lib/infrastructure/db/repositories/project-repository";

import { assertProjectStudent } from "./assert-access";

export async function getStudentProject(
  actor: SessionUser | null,
  trainingId: string,
): Promise<ProjectResult<StudentProject | null>> {
  const forbidden = assertProjectStudent(actor);
  if (forbidden) {
    return forbidden;
  }

  if (!trainingId) {
    return projectFailure(ProjectErrorCode.VALIDATION_ERROR);
  }

  const project = await findProjectByStudentAndTraining(actor!.id, trainingId);
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
