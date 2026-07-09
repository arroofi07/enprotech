import * as XLSX from "xlsx";

import { readExcelRows } from "@/lib/domain/imports/read-excel-rows";
import { validateQuestionRows } from "@/lib/domain/imports/validate-question-rows";

import type { ParsedExcelQuestion } from "./types";

export function parseExcelQuestions(buffer: ArrayBuffer): ParsedExcelQuestion[] {
  const rows = readExcelRows(buffer);
  const validated = validateQuestionRows(rows);
  const questions = validated
    .filter((row) => row.isValid && row.data)
    .map((row) => row.data!);

  if (questions.length === 0) {
    throw new Error("Tidak ada soal valid ditemukan dalam file Excel.");
  }

  return questions;
}

// Legacy helpers kept for any direct usage
import { getCellValue } from "@/lib/domain/imports/read-excel-rows";
export { getCellValue };
