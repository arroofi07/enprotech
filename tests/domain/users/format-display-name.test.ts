import { describe, expect, it } from "vitest";

import { formatUserDisplayName } from "@/lib/domain/users/format-display-name";

describe("formatUserDisplayName", () => {
  it("returns name for active users", () => {
    expect(
      formatUserDisplayName({ name: "Budi", status: "active" }),
    ).toBe("Budi");
  });

  it("returns name for pending users", () => {
    expect(
      formatUserDisplayName({ name: "Siti", status: "pending" }),
    ).toBe("Siti");
  });

  it("appends (nonaktif) for inactive users", () => {
    expect(
      formatUserDisplayName({ name: "Andi", status: "inactive" }),
    ).toBe("Andi (nonaktif)");
  });
});
