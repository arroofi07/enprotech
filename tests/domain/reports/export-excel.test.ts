import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";

import { buildTrainingReportExcelBuffer } from "@/lib/domain/reports/export-excel";
import type { TrainingReportRow } from "@/lib/domain/reports/types";

const sampleRows: TrainingReportRow[] = [
  {
    rowKey: "s1:m1",
    studentId: "s1",
    studentName: "Ani",
    studentEmail: "ani@example.com",
    trainingId: "t1",
    trainingTitle: "Training A",
    moduleId: "m1",
    moduleTitle: "Modul 1",
    moduleOrder: 1,
    quizScore: 80,
    latihanScore: 75,
    moduleStatus: "completed",
    enrollmentStatus: "completed",
    enrolledAt: "2026-01-01T00:00:00.000Z",
    completedAt: "2026-01-02T00:00:00.000Z",
  },
];

describe("buildTrainingReportExcelBuffer", () => {
  it("creates a readable xlsx workbook buffer", () => {
    const buffer = buildTrainingReportExcelBuffer(sampleRows);
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets["Rekap Training"];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);

    expect(rows).toHaveLength(1);
    expect(rows[0]?.["Nama Peserta"]).toBe("Ani");
    expect(rows[0]?.["Nilai Quiz"]).toBe("80");
  });
});
