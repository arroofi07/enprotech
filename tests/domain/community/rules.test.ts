import { describe, expect, it } from "vitest";

import {
  canManageMeeting,
  isValidMeetLink,
  normalizeMeetingDescription,
  normalizeMeetingTitle,
  normalizeMessageBody,
} from "@/lib/domain/community/rules";
import { COMMUNITY_MESSAGE_MAX_LENGTH } from "@/lib/domain/community/types";

describe("normalizeMessageBody", () => {
  it("trims and accepts non-empty bodies", () => {
    expect(normalizeMessageBody("  halo  ")).toBe("halo");
  });

  it("rejects empty and oversized bodies", () => {
    expect(normalizeMessageBody("   ")).toBeNull();
    expect(normalizeMessageBody("a".repeat(COMMUNITY_MESSAGE_MAX_LENGTH + 1))).toBeNull();
  });
});

describe("isValidMeetLink", () => {
  it("accepts http(s) urls", () => {
    expect(isValidMeetLink("https://meet.google.com/abc-defg-hij")).toBe(true);
    expect(isValidMeetLink("http://localhost:3000/room")).toBe(true);
  });

  it("rejects invalid urls", () => {
    expect(isValidMeetLink("not-a-url")).toBe(false);
    expect(isValidMeetLink("ftp://example.com")).toBe(false);
  });
});

describe("normalizeMeetingTitle", () => {
  it("requires a non-empty trimmed title", () => {
    expect(normalizeMeetingTitle("  Sync  ")).toBe("Sync");
    expect(normalizeMeetingTitle("")).toBeNull();
  });
});

describe("normalizeMeetingDescription", () => {
  it("returns null for empty values", () => {
    expect(normalizeMeetingDescription(undefined)).toBeNull();
    expect(normalizeMeetingDescription("  ")).toBeNull();
  });

  it("keeps trimmed descriptions", () => {
    expect(normalizeMeetingDescription(" agenda ")).toBe("agenda");
  });
});

describe("canManageMeeting", () => {
  it("allows only the creator", () => {
    expect(
      canManageMeeting({ actorId: "u1", creatorId: "u1" }),
    ).toBe(true);
    expect(
      canManageMeeting({ actorId: "u1", creatorId: "u2" }),
    ).toBe(false);
  });
});
