import type { SessionUser } from "@/lib/domain/auth/types";
import {
  ProjectErrorCode,
  projectFailure,
  projectSuccess,
  type ProjectResult,
} from "@/lib/domain/projects/errors";
import {
  deleteProjectForStudent,
  findProjectByIdForStudent,
} from "@/lib/infrastructure/db/repositories/project-repository";
import { deleteProjectSchema } from "@/lib/validations/project-schemas";

import { assertProjectStudent } from "./assert-access";

export async function deleteStudentProject(
  actor: SessionUser | null,
  input: unknown,
): Promise<ProjectResult<{ trainingId: string }>> {
  const forbidden = assertProjectStudent(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = deleteProjectSchema.safeParse(input);
  if (!parsed.success) {
    return projectFailure(ProjectErrorCode.VALIDATION_ERROR);
  }

  const project = await findProjectByIdForStudent(
    parsed.data.projectId,
    actor!.id,
  );
  if (!project) {
    return projectFailure(ProjectErrorCode.PROJECT_NOT_FOUND);
  }

  const deleted = await deleteProjectForStudent(
    parsed.data.projectId,
    actor!.id,
  );
  if (!deleted) {
    return projectFailure(ProjectErrorCode.PROJECT_NOT_FOUND);
  }

  return projectSuccess({ trainingId: project.trainingId });
}
