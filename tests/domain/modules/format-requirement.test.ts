import { describe, expect, it } from "vitest";

import { formatModuleRequirement } from "@/lib/domain/modules/format-requirement";

describe("formatModuleRequirement", () => {
  it("returns dash for zero requirement", () => {
    expect(formatModuleRequirement(0)).toBe("—");
  });

  it("formats positive requirement as percentage", () => {
    expect(formatModuleRequirement(75)).toBe("75%");
  });
});
