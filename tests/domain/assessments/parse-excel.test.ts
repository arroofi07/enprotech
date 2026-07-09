import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";

import { parseExcelQuestions } from "@/lib/domain/assessments/parse-excel-questions";
import { getWrongAnswerReviews } from "@/lib/domain/assessments/review-wrong-answers";

function buildWorkbookBuffer(rows: Record<string, string | number>[]) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Soal");
  return XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
}

describe("parseExcelQuestions", () => {
  it("parses valid rows from excel buffer", () => {
    const buffer = buildWorkbookBuffer([
      {
        no: 1,
        question: "Pertanyaan 1",
        option_a: "Opsi A",
        option_b: "Opsi B",
        option_c: "Opsi C",
        option_d: "Opsi D",
        correct_answer: "B",
      },
    ]);

    const questions = parseExcelQuestions(buffer);

    expect(questions).toHaveLength(1);
    expect(questions[0]?.questionText).toBe("Pertanyaan 1");
    expect(questions[0]?.options[1]?.isCorrect).toBe(true);
  });

  it("throws when no valid questions exist", () => {
    const buffer = buildWorkbookBuffer([
      {
        no: 1,
        question: "",
        option_a: "A",
        option_b: "B",
        option_c: "C",
        option_d: "D",
        correct_answer: "A",
      },
    ]);

    expect(() => parseExcelQuestions(buffer)).toThrow(
      "Tidak ada soal valid ditemukan dalam file Excel.",
    );
  });
});

describe("getWrongAnswerReviews", () => {
  it("returns only incorrect answers for review", () => {
    const reviews = getWrongAnswerReviews(
      [
        {
          id: "q1",
          questionText: "Soal 1",
          options: [
            { id: "a", text: "Benar", isCorrect: true },
            { id: "b", text: "Salah", isCorrect: false },
          ],
        },
        {
          id: "q2",
          questionText: "Soal 2",
          options: [
            { id: "c", text: "Benar", isCorrect: true },
            { id: "d", text: "Salah", isCorrect: false },
          ],
        },
      ],
      [
        { questionId: "q1", selectedOptionId: "b" },
        { questionId: "q2", selectedOptionId: "c" },
      ],
    );

    expect(reviews).toHaveLength(1);
    expect(reviews[0]?.questionId).toBe("q1");
    expect(reviews[0]?.correctOptionText).toBe("Benar");
  });
});
