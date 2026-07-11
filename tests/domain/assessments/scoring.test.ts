import { describe, expect, it } from "vitest";

import { getBestScore, hasPassed } from "@/lib/domain/assessments/best-score";
import { calculateScore } from "@/lib/domain/assessments/calculate-score";
import { canRetry } from "@/lib/domain/assessments/can-retry";
import { resolvePassingGrade } from "@/lib/domain/assessments/resolve-passing-grade";

const questions = [
  {
    id: "q1",
    options: [
      { id: "a", text: "A", isCorrect: true },
      { id: "b", text: "B", isCorrect: false },
    ],
  },
  {
    id: "q2",
    options: [
      { id: "c", text: "C", isCorrect: false },
      { id: "d", text: "D", isCorrect: true },
    ],
  },
  {
    id: "q3",
    options: [
      { id: "e", text: "E", isCorrect: false },
      { id: "f", text: "F", isCorrect: true },
    ],
  },
  {
    id: "q4",
    options: [
      { id: "g", text: "G", isCorrect: true },
      { id: "h", text: "H", isCorrect: false },
    ],
  },
];

describe("calculateScore", () => {
  it("returns 0 when there are no questions", () => {
    expect(calculateScore([], [])).toBe(0);
  });

  it("calculates percentage of correct answers", () => {
    const score = calculateScore(questions, [
      { questionId: "q1", selectedOptionId: "a" },
      { questionId: "q2", selectedOptionId: "d" },
      { questionId: "q3", selectedOptionId: "e" },
      { questionId: "q4", selectedOptionId: "h" },
    ]);

    expect(score).toBe(50);
  });

  it("ignores unanswered questions", () => {
    const score = calculateScore(questions, [
      { questionId: "q1", selectedOptionId: "a" },
      { questionId: "q2", selectedOptionId: "d" },
    ]);

    expect(score).toBe(50);
  });
});

describe("getBestScore", () => {
  it("returns 0 for empty attempts", () => {
    expect(getBestScore([])).toBe(0);
  });

  it("returns highest score from attempts", () => {
    expect(getBestScore([40, 75, 60])).toBe(75);
  });
});

describe("hasPassed", () => {
  it("returns true when score meets passing grade", () => {
    expect(hasPassed(70, 70)).toBe(true);
    expect(hasPassed(80, 70)).toBe(true);
  });

  it("returns false when score is below passing grade", () => {
    expect(hasPassed(69, 70)).toBe(false);
  });
});

describe("canRetry", () => {
  it("allows retry when best score is below passing grade", () => {
    expect(
      canRetry({
        submittedAttemptCount: 0,
        maxRetry: null,
        bestScore: 60,
        passingGrade: 70,
      }),
    ).toBe(true);
  });

  it("blocks retry after passing when enabled", () => {
    expect(
      canRetry({
        submittedAttemptCount: 1,
        maxRetry: null,
        bestScore: 80,
        passingGrade: 70,
      }),
    ).toBe(false);
  });

  it("allows retry after passing when disabled", () => {
    expect(
      canRetry({
        submittedAttemptCount: 1,
        maxRetry: null,
        bestScore: 80,
        passingGrade: 70,
        blockRetryAfterPassing: false,
      }),
    ).toBe(true);
  });

  it("blocks pre-test after one submitted attempt", () => {
    expect(
      canRetry({
        submittedAttemptCount: 1,
        maxRetry: 1,
        bestScore: 40,
        passingGrade: 70,
      }),
    ).toBe(false);
  });

  it("allows post-test retry when not passed", () => {
    expect(
      canRetry({
        submittedAttemptCount: 3,
        maxRetry: null,
        bestScore: 60,
        passingGrade: 70,
      }),
    ).toBe(true);
  });
});

describe("resolvePassingGrade", () => {
  it("uses assessment passing grade when set", () => {
    expect(
      resolvePassingGrade({
        type: "quiz",
        assessmentPassingGrade: 85,
        trainingPassingGrade: 70,
      }),
    ).toBe(85);
  });

  it("falls back to training passing grade", () => {
    expect(
      resolvePassingGrade({
        type: "latihan",
        assessmentPassingGrade: null,
        trainingPassingGrade: 70,
      }),
    ).toBe(70);
  });

  it("uses training passing grade for pre-test and post-test", () => {
    expect(
      resolvePassingGrade({
        type: "pre_test",
        assessmentPassingGrade: null,
        trainingPassingGrade: 75,
      }),
    ).toBe(75);

    expect(
      resolvePassingGrade({
        type: "post_test",
        assessmentPassingGrade: null,
        trainingPassingGrade: 75,
      }),
    ).toBe(75);
  });
});
