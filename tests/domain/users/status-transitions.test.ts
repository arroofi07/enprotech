import { describe, expect, it } from "vitest";

import { UserErrorCode } from "@/lib/domain/users/errors";
import {
  resolveSetStatusTransition,
  resolveStatusTransition,
} from "@/lib/domain/users/status-transitions";

describe("resolveStatusTransition", () => {
  it("approves pending users", () => {
    expect(resolveStatusTransition("approve", "pending")).toEqual({
      success: true,
      nextStatus: "active",
    });
  });

  it("rejects approve for non-pending users", () => {
    expect(resolveStatusTransition("approve", "active")).toEqual({
      success: false,
      error: UserErrorCode.INVALID_STATUS_TRANSITION,
    });
  });

  it("deactivates active users", () => {
    expect(resolveStatusTransition("deactivate", "active")).toEqual({
      success: true,
      nextStatus: "inactive",
    });
  });

  it("reactivates inactive users", () => {
    expect(resolveStatusTransition("reactivate", "inactive")).toEqual({
      success: true,
      nextStatus: "active",
    });
  });
});

describe("resolveSetStatusTransition", () => {
  it("maps active target to deactivate", () => {
    expect(resolveSetStatusTransition("active", "inactive")).toEqual({
      success: true,
      nextStatus: "inactive",
    });
  });

  it("maps inactive target to reactivate", () => {
    expect(resolveSetStatusTransition("inactive", "active")).toEqual({
      success: true,
      nextStatus: "active",
    });
  });

  it("rejects pending to inactive", () => {
    expect(resolveSetStatusTransition("pending", "inactive")).toEqual({
      success: false,
      error: UserErrorCode.INVALID_STATUS_TRANSITION,
    });
  });
});
