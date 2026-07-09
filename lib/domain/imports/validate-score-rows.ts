import { z } from "zod";

import type { ImportRow, ParsedScoreRow } from "./types";

const emailSchema = z.string().email("Format student_email tidak valid.");
const trainingIdSchema = z.string().uuid("Format training_id tidak valid.");
const assessmentTypeSchema = z.enum(
  ["quiz", "latihan", "pre_test", "post_test"],
  "assessment_type harus quiz, latihan, pre_test, atau post_test.",
);

function isEmptyRow(row: Record<string, string>): boolean {
  return Object.values(row).every((value) => value === "");
}

export function validateScoreRows(
  rows: Record<string, string>[],
): ImportRow<ParsedScoreRow>[] {
  const results: ImportRow<ParsedScoreRow>[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const errors: string[] = [];

    if (isEmptyRow(row)) {
      return;
    }

    const studentEmail = (row.student_email ?? "").toLowerCase();
    const trainingId = row.training_id ?? "";
    const moduleName = row.module_name ?? "";
    const assessmentTypeRaw = (row.assessment_type ?? "").toLowerCase();
    const scoreRaw = row.score ?? "";

    const emailResult = emailSchema.safeParse(studentEmail);
    if (!emailResult.success) {
      errors.push("Format student_email tidak valid.");
    }

    const trainingResult = trainingIdSchema.safeParse(trainingId);
    if (!trainingResult.success) {
      errors.push("Format training_id tidak valid (harus UUID).");
    }

    const typeResult = assessmentTypeSchema.safeParse(assessmentTypeRaw);
    if (!typeResult.success) {
      errors.push("assessment_type harus quiz, latihan, pre_test, atau post_test.");
    }

    const score = Number(scoreRaw);
    if (!Number.isInteger(score) || score < 0 || score > 100) {
      errors.push("score harus bilangan bulat antara 0 dan 100.");
    }

    const assessmentType = typeResult.success ? typeResult.data : null;
    const needsModule =
      assessmentType === "quiz" || assessmentType === "latihan";

    if (needsModule && !moduleName) {
      errors.push("module_name wajib diisi untuk quiz/latihan.");
    }

    if (!needsModule && moduleName) {
      errors.push("module_name harus kosong untuk pre_test/post_test.");
    }

    results.push({
      rowNumber,
      raw: row,
      data:
        errors.length === 0 && assessmentType
          ? {
              studentEmail,
              trainingId,
              moduleName: moduleName || null,
              assessmentType,
              score,
            }
          : null,
      errors,
      isValid: errors.length === 0,
    });
  });

  return results;
}
