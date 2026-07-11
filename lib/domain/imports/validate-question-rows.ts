import { normalizeQuestionImportRow } from "./normalize-question-import-row";
import type { ImportRow, ParsedQuestionRow } from "./types";

const CORRECT_ANSWER_PATTERN = /^[ABCDE]$/i;

const OPTION_FIELDS = [
  { key: "A", label: "Pilihan A", getValue: (row: ReturnType<typeof normalizeQuestionImportRow>) => row.optionA },
  { key: "B", label: "Pilihan B", getValue: (row: ReturnType<typeof normalizeQuestionImportRow>) => row.optionB },
  { key: "C", label: "Pilihan C", getValue: (row: ReturnType<typeof normalizeQuestionImportRow>) => row.optionC },
  { key: "D", label: "Pilihan D", getValue: (row: ReturnType<typeof normalizeQuestionImportRow>) => row.optionD },
  { key: "E", label: "Pilihan E", getValue: (row: ReturnType<typeof normalizeQuestionImportRow>) => row.optionE },
] as const;

function isEmptyRow(row: Record<string, string>): boolean {
  const normalized = normalizeQuestionImportRow(row);
  return (
    !normalized.questionText &&
    !normalized.optionA &&
    !normalized.optionB &&
    !normalized.optionC &&
    !normalized.optionD &&
    !normalized.optionE &&
    !normalized.correctAnswer
  );
}

export function validateQuestionRows(
  rows: Record<string, string>[],
): ImportRow<ParsedQuestionRow>[] {
  const results: ImportRow<ParsedQuestionRow>[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const errors: string[] = [];

    if (isEmptyRow(row)) {
      return;
    }

    const normalized = normalizeQuestionImportRow(row);

    if (!normalized.questionText) {
      errors.push("Kolom Pertanyaan wajib diisi.");
    }

    const missingOptions = OPTION_FIELDS.filter(
      (option) => !option.getValue(normalized),
    ).map((option) => option.label);

    if (missingOptions.length > 0) {
      errors.push(
        `Semua opsi (Pilihan A sampai Pilihan E) wajib diisi. Kolom kosong: ${missingOptions.join(", ")}.`,
      );
    }

    if (!CORRECT_ANSWER_PATTERN.test(normalized.correctAnswer)) {
      errors.push("Jawaban Benar harus A, B, C, D, atau E.");
    }

    const options = OPTION_FIELDS.map((option) => ({
      key: option.key,
      text: option.getValue(normalized),
    }));

    results.push({
      rowNumber,
      raw: row,
      data:
        errors.length === 0
          ? {
              questionText: normalized.questionText,
              options: options.map((option) => ({
                text: option.text,
                isCorrect: option.key === normalized.correctAnswer,
              })),
            }
          : null,
      errors,
      isValid: errors.length === 0,
    });
  });

  return results;
}
