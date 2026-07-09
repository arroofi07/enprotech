import { describe, expect, it } from "vitest";

import {
  calculateTrainingProgress,
  countCompletedModules,
} from "@/lib/domain/trainings/compute-progress";

describe("calculateTrainingProgress", () => {
  it("returns 0 when there are no modules", () => {
    expect(calculateTrainingProgress(0, 0)).toBe(0);
  });

  it("calculates rounded percentage", () => {
    expect(calculateTrainingProgress(4, 1)).toBe(25);
    expect(calculateTrainingProgress(3, 2)).toBe(67);
  });

  it("caps progress at 100", () => {
    expect(calculateTrainingProgress(2, 5)).toBe(100);
  });
});

describe("countCompletedModules", () => {
  it("counts only completed module progress rows", () => {
    expect(
      countCompletedModules([
        { status: "completed" },
        { status: "in_progress" },
        { status: "completed" },
        { status: "not_started" },
      ]),
    ).toBe(2);
  });
});
