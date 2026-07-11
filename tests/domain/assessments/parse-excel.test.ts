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
  it("parses valid rows from excel buffer with Indonesian headers", () => {
    const buffer = buildWorkbookBuffer([
      {
        Pertanyaan: "Pertanyaan 1",
        "Pilihan A": "Opsi A",
        "Pilihan B": "Opsi B",
        "Pilihan C": "Opsi C",
        "Pilihan D": "Opsi D",
        "Pilihan E": "Opsi E",
        "Jawaban Benar": "B",
      },
    ]);

    const questions = parseExcelQuestions(buffer);

    expect(questions).toHaveLength(1);
    expect(questions[0]?.questionText).toBe("Pertanyaan 1");
    expect(questions[0]?.options).toHaveLength(5);
    expect(questions[0]?.options[1]?.isCorrect).toBe(true);
  });

  it("parses valid rows from excel buffer with legacy English headers", () => {
    const buffer = buildWorkbookBuffer([
      {
        question: "Pertanyaan 1",
        option_a: "Opsi A",
        option_b: "Opsi B",
        option_c: "Opsi C",
        option_d: "Opsi D",
        option_e: "Opsi E",
        correct_answer: "B",
      },
    ]);

    const questions = parseExcelQuestions(buffer);

    expect(questions).toHaveLength(1);
    expect(questions[0]?.options).toHaveLength(5);
  });

  it("throws when no valid questions exist", () => {
    const buffer = buildWorkbookBuffer([
      {
        Pertanyaan: "",
        "Pilihan A": "A",
        "Pilihan B": "B",
        "Pilihan C": "C",
        "Pilihan D": "D",
        "Pilihan E": "E",
        "Jawaban Benar": "A",
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
