import { z } from "zod";

import type { ImportRow, ParsedEnrollmentRow } from "./types";

const emailSchema = z.string().email("Format student_email tidak valid.");
const trainingIdSchema = z.string().uuid("Format training_id tidak valid.");

function isEmptyRow(row: Record<string, string>): boolean {
  return Object.values(row).every((value) => value === "");
}

export function validateEnrollmentRows(
  rows: Record<string, string>[],
): ImportRow<ParsedEnrollmentRow>[] {
  const results: ImportRow<ParsedEnrollmentRow>[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const errors: string[] = [];

    if (isEmptyRow(row)) {
      return;
    }

    const studentEmail = (row.student_email ?? "").toLowerCase();
    const trainingId = row.training_id ?? "";

    const emailResult = emailSchema.safeParse(studentEmail);
    if (!emailResult.success) {
      errors.push("Format student_email tidak valid.");
    }

    const trainingResult = trainingIdSchema.safeParse(trainingId);
    if (!trainingResult.success) {
      errors.push("Format training_id tidak valid (harus UUID).");
    }

    results.push({
      rowNumber,
      raw: row,
      data:
        errors.length === 0
          ? {
              studentEmail,
              trainingId,
            }
          : null,
      errors,
      isValid: errors.length === 0,
    });
  });

  return results;
}
