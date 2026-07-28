import { describe, expect, it } from "vitest";

import { getCommunityWsUrl } from "@/lib/community/ws-url";

describe("getCommunityWsUrl", () => {
  it("prefers NEXT_PUBLIC_COMMUNITY_WS_URL when set", () => {
    const previous = process.env.NEXT_PUBLIC_COMMUNITY_WS_URL;
    process.env.NEXT_PUBLIC_COMMUNITY_WS_URL =
      "wss://example.test/api/community/ws";

    expect(getCommunityWsUrl()).toBe("wss://example.test/api/community/ws");

    if (previous === undefined) {
      delete process.env.NEXT_PUBLIC_COMMUNITY_WS_URL;
    } else {
      process.env.NEXT_PUBLIC_COMMUNITY_WS_URL = previous;
    }
  });
});
