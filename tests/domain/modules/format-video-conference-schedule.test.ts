import { describe, expect, it } from "vitest";

import {
  formatVideoConferenceSchedule,
  parseWibDateTimeLocal,
  toDateTimeLocalValue,
} from "@/lib/domain/modules/format-video-conference-schedule";

describe("parseWibDateTimeLocal", () => {
  it("parses datetime-local values as Asia/Jakarta (WIB)", () => {
    const parsed = parseWibDateTimeLocal("2026-07-20T14:30");

    expect(parsed).not.toBeNull();
    expect(parsed!.toISOString()).toBe("2026-07-20T07:30:00.000Z");
  });

  it("returns null for invalid values", () => {
    expect(parseWibDateTimeLocal("invalid")).toBeNull();
    expect(parseWibDateTimeLocal("2026-13-01T10:00")).toBeNull();
  });
});

describe("toDateTimeLocalValue", () => {
  it("formats an instant back into a WIB datetime-local value", () => {
    const instant = new Date("2026-07-20T07:30:00.000Z");

    expect(toDateTimeLocalValue(instant)).toBe("2026-07-20T14:30");
  });
});

describe("formatVideoConferenceSchedule", () => {
  it("formats the schedule in Indonesian WIB", () => {
    const label = formatVideoConferenceSchedule(
      new Date("2026-07-20T07:30:00.000Z"),
    );

    expect(label).toContain("14.30");
    expect(label.toLowerCase()).toMatch(/wib|gmt\+7/);
  });
});
