import { describe, expect, it } from "vitest";

import {
  canAccessCertificate,
  canAccessModules,
  canAccessPostTest,
  hasCompletedPretest,
  hasPassedPostTest,
} from "@/lib/domain/training-flow/gates";

describe("canAccessModules", () => {
  it("blocks when pre-test is not active", () => {
    expect(
      canAccessModules({
        isPretestActive: false,
        hasCompletedPretest: false,
      }),
    ).toBe(false);
  });

  it("blocks when pre-test is active but not completed", () => {
    expect(
      canAccessModules({
        isPretestActive: true,
        hasCompletedPretest: false,
      }),
    ).toBe(false);
  });

  it("allows access when pre-test is active and completed", () => {
    expect(
      canAccessModules({
        isPretestActive: true,
        hasCompletedPretest: true,
      }),
    ).toBe(true);
  });
});

describe("canAccessPostTest", () => {
  it("blocks when not all modules completed", () => {
    expect(canAccessPostTest(false)).toBe(false);
  });

  it("allows when all modules completed", () => {
    expect(canAccessPostTest(true)).toBe(true);
  });
});

describe("hasCompletedPretest", () => {
  it("returns false with zero attempts", () => {
    expect(hasCompletedPretest(0)).toBe(false);
  });

  it("returns true after one submitted attempt", () => {
    expect(hasCompletedPretest(1)).toBe(true);
  });
});

describe("hasPassedPostTest", () => {
  it("returns true when best score meets passing grade", () => {
    expect(hasPassedPostTest(80, 70)).toBe(true);
  });

  it("returns false when best score is below passing grade", () => {
    expect(hasPassedPostTest(60, 70)).toBe(false);
  });
});

describe("canAccessCertificate", () => {
  it("requires passed post-test", () => {
    expect(canAccessCertificate(false)).toBe(false);
    expect(canAccessCertificate(true)).toBe(true);
  });
});
