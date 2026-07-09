import { describe, expect, it } from "vitest";

import { computeFinalGrade } from "@/lib/domain/certificates/compute-final-grade";

describe("computeFinalGrade", () => {
  it("returns rounded average of pre and post test scores", () => {
    expect(computeFinalGrade(70, 90)).toBe(80);
    expect(computeFinalGrade(81, 84)).toBe(83);
  });
});
