import { describe, expect, it } from "vitest";

import {
  getQuestionWeightStatus,
  getScoredQuestionCount,
  getWeightedTotal,
  roundWeight,
  suggestQuestionWeight,
} from "@/lib/domain/assessments/question-weight";

describe("getScoredQuestionCount", () => {
  it("counts every question when no display limit is set", () => {
    expect(getScoredQuestionCount(40, null)).toBe(40);
  });

  it("counts only the questions shown to the peserta", () => {
    expect(getScoredQuestionCount(40, 20)).toBe(20);
  });

  it("never counts more questions than exist", () => {
    expect(getScoredQuestionCount(10, 20)).toBe(10);
  });
});

describe("getWeightedTotal", () => {
  it("multiplies the weight by the scored question count", () => {
    expect(getWeightedTotal(40, 2.5)).toBe(100);
    expect(getWeightedTotal(20, 5)).toBe(100);
  });

  it("keeps float multiplication from leaking noise into the total", () => {
    // 3 * 0.29 = 0.8699999999999999 tanpa pembulatan.
    expect(getWeightedTotal(3, 0.29)).toBe(0.87);
  });
});

describe("suggestQuestionWeight", () => {
  it("suggests the weight that totals exactly 100", () => {
    expect(suggestQuestionWeight(40)).toBe(2.5);
    expect(suggestQuestionWeight(8)).toBe(12.5);
  });

  it("returns null when there are no questions to weigh", () => {
    expect(suggestQuestionWeight(0)).toBeNull();
  });

  it("rounds to the 2 decimals the column can store", () => {
    expect(suggestQuestionWeight(3)).toBe(33.33);
  });
});

describe("getQuestionWeightStatus", () => {
  it("reports an unset weight as even scoring", () => {
    expect(
      getQuestionWeightStatus({ scoredQuestionCount: 40, questionWeight: null }),
    ).toBe("unset");
  });

  it("flags a weight set before any question exists", () => {
    expect(
      getQuestionWeightStatus({ scoredQuestionCount: 0, questionWeight: 2.5 }),
    ).toBe("no_questions");
  });

  it("reports an exact total of 100", () => {
    expect(
      getQuestionWeightStatus({ scoredQuestionCount: 40, questionWeight: 2.5 }),
    ).toBe("exact");
  });

  it("warns when the total misses 100 in either direction", () => {
    expect(
      getQuestionWeightStatus({ scoredQuestionCount: 40, questionWeight: 3 }),
    ).toBe("over");
    expect(
      getQuestionWeightStatus({ scoredQuestionCount: 30, questionWeight: 2.5 }),
    ).toBe("under");
  });
});

describe("roundWeight", () => {
  it("keeps 2 decimals intact", () => {
    expect(roundWeight(2.5)).toBe(2.5);
    expect(roundWeight(33.33)).toBe(33.33);
  });

  it("rounds off precision the column cannot store", () => {
    expect(roundWeight(33.333)).toBe(33.33);
  });
});
