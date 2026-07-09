import type { ImportRow, ParsedQuestionRow } from "./types";

const CORRECT_ANSWER_PATTERN = /^[ABCD]$/i;

function isEmptyRow(row: Record<string, string>): boolean {
  return Object.values(row).every((value) => value === "");
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

    const questionText = row.question ?? "";
    const optionA = row.option_a ?? "";
    const optionB = row.option_b ?? "";
    const optionC = row.option_c ?? "";
    const optionD = row.option_d ?? "";
    const correctAnswer = (row.correct_answer ?? "").toUpperCase();

    if (!questionText) {
      errors.push("Kolom question wajib diisi.");
    }

    if (!optionA || !optionB || !optionC || !optionD) {
      errors.push("Semua opsi (option_a sampai option_d) wajib diisi.");
    }

    if (!CORRECT_ANSWER_PATTERN.test(correctAnswer)) {
      errors.push("correct_answer harus A, B, C, atau D.");
    }

    const options = [
      { key: "A", text: optionA },
      { key: "B", text: optionB },
      { key: "C", text: optionC },
      { key: "D", text: optionD },
    ];

    results.push({
      rowNumber,
      raw: row,
      data:
        errors.length === 0
          ? {
              questionText,
              options: options.map((option) => ({
                text: option.text,
                isCorrect: option.key === correctAnswer,
              })),
            }
          : null,
      errors,
      isValid: errors.length === 0,
    });
  });

  return results;
}
