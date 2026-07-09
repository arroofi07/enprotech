import { describe, expect, it } from "vitest";

import {
  buildExportRows,
  REPORT_EXPORT_HEADERS,
} from "@/lib/domain/reports/build-export-rows";
import type { TrainingReportRow } from "@/lib/domain/reports/types";

const sampleRow: TrainingReportRow = {
  rowKey: "student-1:module-1",
  studentId: "student-1",
  studentName: "Budi Santoso",
  studentEmail: "budi@example.com",
  trainingId: "training-1",
  trainingTitle: "Leadership 101",
  moduleId: "module-1",
  moduleTitle: "Modul 1",
  moduleOrder: 1,
  quizScore: 85,
  latihanScore: 90,
  moduleStatus: "completed",
  enrollmentStatus: "in_progress",
  enrolledAt: "2026-01-10T08:00:00.000Z",
  completedAt: "2026-01-12T10:30:00.000Z",
};

describe("buildExportRows", () => {
  it("maps report rows into export-friendly labels", () => {
    const [row] = buildExportRows([sampleRow]);

    expect(row.studentName).toBe("Budi Santoso");
    expect(row.quizScore).toBe("85");
    expect(row.latihanScore).toBe("90");
    expect(row.moduleStatus).toBe("Selesai");
    expect(row.enrollmentStatus).toBe("Sedang Berjalan");
    expect(row.completedAt).not.toBe("-");
  });

  it("uses dash for missing scores", () => {
    const [row] = buildExportRows([
      {
        ...sampleRow,
        quizScore: null,
        latihanScore: null,
        completedAt: null,
      },
    ]);

    expect(row.quizScore).toBe("-");
    expect(row.latihanScore).toBe("-");
    expect(row.completedAt).toBe("-");
  });

  it("defines stable export headers", () => {
    expect(REPORT_EXPORT_HEADERS.studentName).toBe("Nama Student");
    expect(REPORT_EXPORT_HEADERS.moduleTitle).toBe("Modul");
  });
});
