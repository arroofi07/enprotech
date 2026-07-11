import { describe, expect, it } from "vitest";

import {
  canAccessModuleByOrder,
  isAssessmentRequirementMet,
  isModuleProgressionComplete,
} from "@/lib/domain/modules/module-progression";

const modules = [
  { id: "m1", order: 0 },
  { id: "m2", order: 1 },
  { id: "m3", order: 2 },
];

describe("isAssessmentRequirementMet", () => {
  it("returns true when there are no questions", () => {
    expect(isAssessmentRequirementMet(0, 0)).toBe(true);
  });

  it("returns false when questions exist but not submitted", () => {
    expect(isAssessmentRequirementMet(0, 5)).toBe(false);
  });

  it("returns true when questions exist and submitted", () => {
    expect(isAssessmentRequirementMet(1, 5)).toBe(true);
  });
});

describe("isModuleProgressionComplete", () => {
  it("returns true when both assessments are satisfied", () => {
    expect(
      isModuleProgressionComplete({
        quiz: { submittedCount: 1, questionCount: 3 },
        latihan: { submittedCount: 1, questionCount: 2 },
      }),
    ).toBe(true);
  });

  it("returns true when both assessments have no questions", () => {
    expect(
      isModuleProgressionComplete({
        quiz: { submittedCount: 0, questionCount: 0 },
        latihan: { submittedCount: 0, questionCount: 0 },
      }),
    ).toBe(true);
  });

  it("returns false when only quiz is submitted", () => {
    expect(
      isModuleProgressionComplete({
        quiz: { submittedCount: 1, questionCount: 3 },
        latihan: { submittedCount: 0, questionCount: 2 },
      }),
    ).toBe(false);
  });
});

describe("canAccessModuleByOrder", () => {
  it("allows access to the first module", () => {
    expect(canAccessModuleByOrder(modules, "m1", {})).toBe(true);
  });

  it("blocks access when previous modules are incomplete", () => {
    expect(
      canAccessModuleByOrder(modules, "m2", {
        m1: false,
      }),
    ).toBe(false);
  });

  it("allows access when all previous modules are complete", () => {
    expect(
      canAccessModuleByOrder(modules, "m3", {
        m1: true,
        m2: true,
      }),
    ).toBe(true);
  });
});
