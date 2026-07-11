import { describe, expect, it } from "vitest";

import { filterQuestions } from "@/lib/domain/assessments/filter-questions";
import type { QuestionRecord } from "@/lib/infrastructure/db/repositories/assessment-repository";

const sampleQuestions: QuestionRecord[] = [
  {
    id: "1",
    assessmentId: "a1",
    questionText: "Apa itu React?",
    options: [
      { text: "Library UI", isCorrect: true },
      { text: "Database", isCorrect: false },
      { text: "OS", isCorrect: false },
      { text: "Browser", isCorrect: false },
      { text: "Server", isCorrect: false },
    ],
    order: 0,
    createdAt: new Date(),
  },
  {
    id: "2",
    assessmentId: "a1",
    questionText: "Manakah yang merupakan database?",
    options: [
      { text: "PostgreSQL", isCorrect: true },
      { text: "React", isCorrect: false },
      { text: "Tailwind", isCorrect: false },
      { text: "Next.js", isCorrect: false },
      { text: "Vite", isCorrect: false },
    ],
    order: 1,
    createdAt: new Date(),
  },
];

describe("filterQuestions", () => {
  it("returns all questions when search is empty", () => {
    expect(filterQuestions(sampleQuestions)).toEqual(sampleQuestions);
    expect(filterQuestions(sampleQuestions, "   ")).toEqual(sampleQuestions);
  });

  it("filters by question text", () => {
    const result = filterQuestions(sampleQuestions, "apa itu");
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("1");
  });

  it("filters by option text", () => {
    const result = filterQuestions(sampleQuestions, "postgresql");
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("2");
  });

  it("is case insensitive", () => {
    const result = filterQuestions(sampleQuestions, "manakah");
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("2");
  });
});
