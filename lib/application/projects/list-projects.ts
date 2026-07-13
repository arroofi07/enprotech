import type { SessionUser } from "@/lib/domain/auth/types";
import {
  ProjectErrorCode,
  projectFailure,
  projectSuccess,
  type ProjectResult,
} from "@/lib/domain/projects/errors";
import {
  listProjects as listProjectsInRepo,
  type ProjectListItem,
} from "@/lib/infrastructure/db/repositories/project-repository";
import { listProjectsSchema } from "@/lib/validations/project-schemas";
import { buildPaginatedResult } from "@/lib/validations/pagination-schemas";

import { assertProjectTrainerOrAdmin } from "./assert-access";

export type ListProjectsResult = {
  items: ProjectListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function listProjects(
  actor: SessionUser | null,
  input: unknown = {},
): Promise<ProjectResult<ListProjectsResult>> {
  const forbidden = assertProjectTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = listProjectsSchema.safeParse(input);
  if (!parsed.success) {
    return projectFailure(ProjectErrorCode.VALIDATION_ERROR);
  }

  const { page, pageSize, search, trainingId } = parsed.data;
  const result = await listProjectsInRepo({ page, pageSize, search, trainingId });

  return projectSuccess(
    buildPaginatedResult(result.items, result.total, page, pageSize),
  );
}
