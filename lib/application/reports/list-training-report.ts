import type { SessionUser } from "@/lib/domain/auth/types";
import {
  ReportErrorCode,
  reportFailure,
  reportSuccess,
  type ReportResult,
} from "@/lib/domain/reports/errors";
import type { TrainingReportRow } from "@/lib/domain/reports/types";
import { listTrainingReportRows } from "@/lib/infrastructure/db/repositories/report-repository";
import { listTrainingReportQuerySchema } from "@/lib/validations/report-schemas";

import { assertReportTrainerOrAdmin } from "./assert-trainer-or-admin";

export type ListTrainingReportResult = {
  items: TrainingReportRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function listTrainingReport(
  actor: SessionUser | null,
  input: unknown,
): Promise<ReportResult<ListTrainingReportResult>> {
  const forbidden = assertReportTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = listTrainingReportQuerySchema.safeParse(input);
  if (!parsed.success) {
    return reportFailure(ReportErrorCode.VALIDATION_ERROR);
  }

  const { page, pageSize, ...filters } = parsed.data;
  const result = await listTrainingReportRows({
    ...filters,
    page,
    pageSize,
  });

  return reportSuccess({
    items: result.items,
    total: result.total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(result.total / pageSize)),
  });
}
