import * as XLSX from "xlsx";

import {
  buildExportRows,
  REPORT_EXPORT_HEADERS,
} from "@/lib/domain/reports/build-export-rows";
import type { TrainingReportRow } from "@/lib/domain/reports/types";

export function buildTrainingReportExcelBuffer(
  rows: TrainingReportRow[],
): ArrayBuffer {
  const exportRows = buildExportRows(rows);
  const worksheet = XLSX.utils.json_to_sheet(exportRows, {
    header: Object.keys(REPORT_EXPORT_HEADERS),
  });

  const headerKeys = Object.keys(
    REPORT_EXPORT_HEADERS,
  ) as (keyof typeof REPORT_EXPORT_HEADERS)[];
  worksheet["!cols"] = headerKeys.map((key) => ({
    wch: Math.max(REPORT_EXPORT_HEADERS[key].length, 14),
  }));

  const headerRow = headerKeys.map((key) => REPORT_EXPORT_HEADERS[key]);
  XLSX.utils.sheet_add_aoa(worksheet, [headerRow], { origin: "A1" });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Training");

  return XLSX.write(workbook, { type: "array", bookType: "xlsx" });
}
