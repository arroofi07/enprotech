import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import {
  buildExportRows,
  REPORT_EXPORT_HEADERS,
} from "@/lib/domain/reports/build-export-rows";
import type { TrainingReportRow } from "@/lib/domain/reports/types";

export function buildTrainingReportPdfBuffer(
  rows: TrainingReportRow[],
): ArrayBuffer {
  const exportRows = buildExportRows(rows);
  const headerKeys = Object.keys(
    REPORT_EXPORT_HEADERS,
  ) as (keyof typeof REPORT_EXPORT_HEADERS)[];

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
  });

  doc.setFontSize(14);
  doc.text("Rekap Hasil Training", 40, 36);
  doc.setFontSize(9);
  doc.text(`Diekspor: ${new Date().toLocaleString("id-ID")}`, 40, 52);
  doc.text(`Total baris: ${rows.length}`, 40, 64);

  autoTable(doc, {
    startY: 76,
    head: [headerKeys.map((key) => REPORT_EXPORT_HEADERS[key])],
    body: exportRows.map((row) => headerKeys.map((key) => row[key])),
    styles: {
      fontSize: 8,
      cellPadding: 4,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
    },
    margin: { left: 24, right: 24 },
  });

  return doc.output("arraybuffer");
}
