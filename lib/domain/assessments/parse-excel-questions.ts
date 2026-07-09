import * as XLSX from "xlsx";

import type { ParsedExcelQuestion } from "./types";

const CORRECT_ANSWER_PATTERN = /^[ABCD]$/i;

type ExcelRow = {
  no?: number | string;
  question?: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_answer?: string;
};

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

function getCellValue(row: Record<string, unknown>, key: string): string {
  const normalizedKey = normalizeHeader(key);
  const entry = Object.entries(row).find(
    ([header]) => normalizeHeader(header) === normalizedKey,
  );

  if (!entry) {
    return "";
  }

  const value = entry[1];
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function parseRow(row: Record<string, unknown>): ParsedExcelQuestion | null {
  const questionText = getCellValue(row, "question");
  const optionA = getCellValue(row, "option_a");
  const optionB = getCellValue(row, "option_b");
  const optionC = getCellValue(row, "option_c");
  const optionD = getCellValue(row, "option_d");
  const correctAnswer = getCellValue(row, "correct_answer").toUpperCase();

  if (!questionText) {
    return null;
  }

  const options = [
    { key: "A", text: optionA },
    { key: "B", text: optionB },
    { key: "C", text: optionC },
    { key: "D", text: optionD },
  ];

  if (options.some((option) => !option.text)) {
    throw new Error("Setiap soal harus memiliki 4 opsi jawaban.");
  }

  if (!CORRECT_ANSWER_PATTERN.test(correctAnswer)) {
    throw new Error("Jawaban benar harus A, B, C, atau D.");
  }

  return {
    questionText,
    options: options.map((option) => ({
      text: option.text,
      isCorrect: option.key === correctAnswer,
    })),
  };
}

export function parseExcelQuestions(buffer: ArrayBuffer): ParsedExcelQuestion[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error("File Excel tidak memiliki sheet.");
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<ExcelRow>(sheet, { defval: "" });

  const questions: ParsedExcelQuestion[] = [];

  for (const row of rows) {
    const parsed = parseRow(row as Record<string, unknown>);
    if (parsed) {
      questions.push(parsed);
    }
  }

  if (questions.length === 0) {
    throw new Error("Tidak ada soal valid ditemukan dalam file Excel.");
  }

  return questions;
}
