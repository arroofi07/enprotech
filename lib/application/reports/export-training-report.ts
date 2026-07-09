import type { SessionUser } from "@/lib/domain/auth/types";
import { buildTrainingReportExcelBuffer } from "@/lib/domain/reports/export-excel";
import { buildTrainingReportPdfBuffer } from "@/lib/domain/reports/export-pdf";
import {
  ReportErrorCode,
  reportFailure,
  reportSuccess,
  type ReportResult,
} from "@/lib/domain/reports/errors";
import type { ReportExportFormat } from "@/lib/domain/reports/types";
import { listAllTrainingReportRows } from "@/lib/infrastructure/db/repositories/report-repository";
import { exportTrainingReportQuerySchema } from "@/lib/validations/report-schemas";

import { assertReportTrainerOrAdmin } from "./assert-trainer-or-admin";

export type ExportTrainingReportResult = {
  buffer: ArrayBuffer;
  format: ReportExportFormat;
  filename: string;
  contentType: string;
};

function buildFilename(format: ReportExportFormat): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return format === "xlsx"
    ? `rekap-training-${stamp}.xlsx`
    : `rekap-training-${stamp}.pdf`;
}

export async function exportTrainingReport(
  actor: SessionUser | null,
  input: unknown,
): Promise<ReportResult<ExportTrainingReportResult>> {
  const forbidden = assertReportTrainerOrAdmin(actor);
  if (forbidden) {
    return reportFailure(ReportErrorCode.FORBIDDEN);
  }

  const parsed = exportTrainingReportQuerySchema.safeParse(input);
  if (!parsed.success) {
    return reportFailure(ReportErrorCode.VALIDATION_ERROR);
  }

  const { format, ...filters } = parsed.data;
  const rows = await listAllTrainingReportRows(filters);

  if (format === "xlsx") {
    return reportSuccess({
      buffer: buildTrainingReportExcelBuffer(rows),
      format,
      filename: buildFilename(format),
      contentType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  }

  return reportSuccess({
    buffer: buildTrainingReportPdfBuffer(rows),
    format,
    filename: buildFilename(format),
    contentType: "application/pdf",
  });
}
