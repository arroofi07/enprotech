import * as XLSX from "xlsx";

import type { ImportRow } from "./types";

export function buildImportErrorReportBuffer(
  rows: ImportRow<unknown>[],
): ArrayBuffer {
  const invalidRows = rows.filter((row) => !row.isValid);

  const exportRows = invalidRows.map((row) => ({
    row_number: row.rowNumber,
    errors: row.errors.join("; "),
    ...row.raw,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Errors");

  return XLSX.write(workbook, { type: "array", bookType: "xlsx" });
}
