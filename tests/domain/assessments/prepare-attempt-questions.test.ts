import { describe, expect, it } from "vitest";

import {
  getEffectiveDisplayCount,
  prepareAttemptQuestions,
  resolveAttemptQuestions,
} from "@/lib/domain/assessments/prepare-attempt-questions";

const questions = [
  { id: "q1" },
  { id: "q2" },
  { id: "q3" },
  { id: "q4" },
  { id: "q5" },
];

describe("prepareAttemptQuestions", () => {
  it("returns all questions when display count is not set", () => {
    const result = prepareAttemptQuestions(
      questions,
      { questionDisplayCount: null, shuffleQuestions: false },
      "seed-1",
    );

    expect(result.map((item) => item.id)).toEqual([
      "q1",
      "q2",
      "q3",
      "q4",
      "q5",
    ]);
  });

  it("limits the number of displayed questions", () => {
    const result = prepareAttemptQuestions(
      questions,
      { questionDisplayCount: 3, shuffleQuestions: false },
      "seed-1",
    );

    expect(result).toHaveLength(3);
    expect(result.map((item) => item.id)).toEqual(["q1", "q2", "q3"]);
  });

  it("shuffles questions deterministically for the same seed", () => {
    const first = prepareAttemptQuestions(
      questions,
      { questionDisplayCount: null, shuffleQuestions: true },
      "seed-abc",
    );
    const second = prepareAttemptQuestions(
      questions,
      { questionDisplayCount: null, shuffleQuestions: true },
      "seed-abc",
    );

    expect(first.map((item) => item.id)).toEqual(second.map((item) => item.id));
    expect(first.map((item) => item.id)).not.toEqual([
      "q1",
      "q2",
      "q3",
      "q4",
      "q5",
    ]);
  });
});

describe("resolveAttemptQuestions", () => {
  it("returns questions in stored attempt order", () => {
    const result = resolveAttemptQuestions(questions, ["q3", "q1"]);

    expect(result.map((item) => item.id)).toEqual(["q3", "q1"]);
  });
});

describe("getEffectiveDisplayCount", () => {
  it("returns total when display count is empty", () => {
    expect(getEffectiveDisplayCount(10, null)).toBe(10);
  });

  it("returns configured count when smaller than total", () => {
    expect(getEffectiveDisplayCount(10, 4)).toBe(4);
  });
});
