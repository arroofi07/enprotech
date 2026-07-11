import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";

import { validateEnrollmentRows } from "@/lib/domain/imports/validate-enrollment-rows";
import { validateQuestionRows } from "@/lib/domain/imports/validate-question-rows";
import { validateScoreRows } from "@/lib/domain/imports/validate-score-rows";

function buildRows(rows: Record<string, string | number>[]) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  const sheet = workbook.Sheets.Sheet1!;
  return XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
    defval: "",
  }).map((row) => {
    const normalized: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      normalized[key.trim().toLowerCase().replace(/\s+/g, "_")] = String(value).trim();
    }
    return normalized;
  });
}

const validIndonesianRow = {
  Pertanyaan: "Pertanyaan?",
  "Pilihan A": "A",
  "Pilihan B": "B",
  "Pilihan C": "C",
  "Pilihan D": "D",
  "Pilihan E": "E",
  "Jawaban Benar": "A",
};

describe("validateQuestionRows", () => {
  it("accepts valid question rows with Indonesian headers", () => {
    const rows = validateQuestionRows(buildRows([validIndonesianRow]));

    expect(rows).toHaveLength(1);
    expect(rows[0]?.isValid).toBe(true);
    expect(rows[0]?.data?.options).toHaveLength(5);
  });

  it("accepts valid question rows with legacy English headers", () => {
    const rows = validateQuestionRows(
      buildRows([
        {
          question: "Pertanyaan?",
          option_a: "A",
          option_b: "B",
          option_c: "C",
          option_d: "D",
          option_e: "E",
          correct_answer: "A",
        },
      ]),
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]?.isValid).toBe(true);
  });

  it("ignores legacy no column when other fields are valid", () => {
    const rows = validateQuestionRows(
      buildRows([
        {
          no: 1,
          ...validIndonesianRow,
        },
      ]),
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]?.isValid).toBe(true);
  });

  it("reports row errors when Pilihan E is empty", () => {
    const rows = validateQuestionRows(
      buildRows([
        {
          ...validIndonesianRow,
          "Pilihan E": "",
        },
      ]),
    );

    expect(rows[0]?.isValid).toBe(false);
    expect(rows[0]?.errors[0]).toContain("Pilihan E");
  });

  it("reports row errors for invalid correct answer", () => {
    const rows = validateQuestionRows(
      buildRows([
        {
          ...validIndonesianRow,
          "Jawaban Benar": "Z",
        },
      ]),
    );

    expect(rows[0]?.isValid).toBe(false);
    expect(rows[0]?.errors[0]).toContain("Jawaban Benar");
  });
});

describe("validateEnrollmentRows", () => {
  it("accepts valid enrollment rows", () => {
    const rows = validateEnrollmentRows(
      buildRows([
        {
          student_email: "student@example.com",
          training_id: "550e8400-e29b-41d4-a716-446655440000",
        },
      ]),
    );

    expect(rows[0]?.isValid).toBe(true);
  });
});

describe("validateScoreRows", () => {
  it("requires module_name for quiz rows", () => {
    const rows = validateScoreRows(
      buildRows([
        {
          student_email: "student@example.com",
          training_id: "550e8400-e29b-41d4-a716-446655440000",
          module_name: "",
          assessment_type: "quiz",
          score: 80,
        },
      ]),
    );

    expect(rows[0]?.isValid).toBe(false);
  });
});
