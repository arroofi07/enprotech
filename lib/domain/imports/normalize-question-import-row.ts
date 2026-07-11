export type NormalizedQuestionImportRow = {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE: string;
  correctAnswer: string;
};

function firstNonEmpty(row: Record<string, string>, keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (value) {
      return value;
    }
  }

  return "";
}

export function normalizeQuestionImportRow(
  row: Record<string, string>,
): NormalizedQuestionImportRow {
  return {
    questionText: firstNonEmpty(row, ["pertanyaan", "question"]),
    optionA: firstNonEmpty(row, ["pilihan_a", "option_a"]),
    optionB: firstNonEmpty(row, ["pilihan_b", "option_b"]),
    optionC: firstNonEmpty(row, ["pilihan_c", "option_c"]),
    optionD: firstNonEmpty(row, ["pilihan_d", "option_d"]),
    optionE: firstNonEmpty(row, ["pilihan_e", "option_e"]),
    correctAnswer: firstNonEmpty(row, ["jawaban_benar", "correct_answer"]).toUpperCase(),
  };
}

export function isIgnoredQuestionImportColumn(key: string): boolean {
  return key === "no" || key === "nomor" || key === "nomor_urut";
}
