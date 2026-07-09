import type { ReportExportRow, TrainingReportRow } from "@/lib/domain/reports/types";

import {
  formatDateTime,
  formatEnrollmentStatus,
  formatModuleStatus,
  formatScore,
} from "./format-labels";

export function buildExportRows(rows: TrainingReportRow[]): ReportExportRow[] {
  return rows.map((row) => ({
    studentName: row.studentName,
    studentEmail: row.studentEmail,
    trainingTitle: row.trainingTitle,
    moduleTitle: row.moduleTitle,
    quizScore: formatScore(row.quizScore),
    latihanScore: formatScore(row.latihanScore),
    moduleStatus: formatModuleStatus(row.moduleStatus),
    enrollmentStatus: formatEnrollmentStatus(row.enrollmentStatus),
    enrolledAt: formatDateTime(row.enrolledAt),
    completedAt: formatDateTime(row.completedAt),
  }));
}

export const REPORT_EXPORT_HEADERS: Record<keyof ReportExportRow, string> = {
  studentName: "Nama Student",
  studentEmail: "Email",
  trainingTitle: "Training",
  moduleTitle: "Modul",
  quizScore: "Nilai Quiz",
  latihanScore: "Nilai Latihan",
  moduleStatus: "Status Modul",
  enrollmentStatus: "Status Enrollment",
  enrolledAt: "Tanggal Daftar",
  completedAt: "Tanggal Selesai Modul",
};
