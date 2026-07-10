import type { SessionUser } from "@/lib/domain/auth/types";
import {
  AssessmentErrorCode,
  assessmentFailure,
  assessmentSuccess,
  type AssessmentResult,
} from "@/lib/domain/assessments/errors";
import type { ModuleAssessmentType } from "@/lib/domain/assessments/types";
import {
  listModuleAssessmentHub,
  type ModuleAssessmentHubRow,
} from "@/lib/infrastructure/db/repositories/assessment-repository";
import { buildPaginatedResult } from "@/lib/validations/pagination-schemas";
import { listModuleAssessmentHubSchema } from "@/lib/validations/assessment-schemas";

import { assertAssessmentTrainerOrAdmin } from "./assert-access";

export type ListModuleAssessmentHubResult = {
  items: ModuleAssessmentHubRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function listModuleAssessmentHubItems(
  actor: SessionUser | null,
  input: unknown,
): Promise<AssessmentResult<ListModuleAssessmentHubResult>> {
  const forbidden = assertAssessmentTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = listModuleAssessmentHubSchema.safeParse(input);
  if (!parsed.success) {
    return assessmentFailure(AssessmentErrorCode.VALIDATION_ERROR);
  }

  const { page, pageSize, search, type } = parsed.data;
  const result = await listModuleAssessmentHub({
    type: type as ModuleAssessmentType,
    search,
    page,
    pageSize,
  });

  return assessmentSuccess(
    buildPaginatedResult(result.items, result.total, page, pageSize),
  );
}
