import { describe, expect, it } from "vitest";

import { areAllQuestionsAnswered } from "@/lib/domain/assessments/are-all-questions-answered";
import { getBestScore, hasPassed } from "@/lib/domain/assessments/best-score";
import { calculateScore } from "@/lib/domain/assessments/calculate-score";
import { canRetry } from "@/lib/domain/assessments/can-retry";
import { isAttemptTimedOut } from "@/lib/domain/assessments/is-attempt-timed-out";
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

describe("areAllQuestionsAnswered", () => {
  it("requires one valid answer for every displayed question", () => {
    expect(
      areAllQuestionsAnswered(questions, [
        { questionId: "q1", selectedOptionId: "a" },
        { questionId: "q2", selectedOptionId: "d" },
        { questionId: "q3", selectedOptionId: "f" },
        { questionId: "q4", selectedOptionId: "g" },
      ]),
    ).toBe(true);

    expect(
      areAllQuestionsAnswered(questions, [
        { questionId: "q1", selectedOptionId: "a" },
        { questionId: "q2", selectedOptionId: "d" },
      ]),
    ).toBe(false);
  });

  it("rejects an option that does not belong to its question", () => {
    expect(
      areAllQuestionsAnswered(questions, [
        { questionId: "q1", selectedOptionId: "d" },
        { questionId: "q2", selectedOptionId: "d" },
        { questionId: "q3", selectedOptionId: "f" },
        { questionId: "q4", selectedOptionId: "g" },
      ]),
    ).toBe(false);
  });
});

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

describe("isAttemptTimedOut", () => {
  it("returns false when there is no time limit", () => {
    expect(
      isAttemptTimedOut(
        { startedAt: new Date("2026-01-01T00:00:00.000Z") },
        { timeLimit: null },
        new Date("2026-01-01T01:00:00.000Z"),
      ),
    ).toBe(false);
  });

  it("returns true once the time limit has elapsed", () => {
    expect(
      isAttemptTimedOut(
        { startedAt: new Date("2026-01-01T00:00:00.000Z") },
        { timeLimit: 10 },
        new Date("2026-01-01T00:10:00.000Z"),
      ),
    ).toBe(true);
  });
});

describe("canRetry", () => {
  it("allows retry when best score is below passing grade", () => {
    expect(
      canRetry({
        bestScore: 60,
        passingGrade: 70,
      }),
    ).toBe(true);
  });

  it("blocks retry after passing when enabled", () => {
    expect(
      canRetry({
        bestScore: 80,
        passingGrade: 70,
      }),
    ).toBe(false);
  });

  it("allows retry after passing when disabled", () => {
    expect(
      canRetry({
        bestScore: 80,
        passingGrade: 70,
        blockRetryAfterPassing: false,
      }),
    ).toBe(true);
  });

  it("allows a failed pre-test to be retried", () => {
    expect(
      canRetry({
        bestScore: 40,
        passingGrade: 70,
      }),
    ).toBe(true);
  });

  it("allows post-test retry when not passed", () => {
    expect(
      canRetry({
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
