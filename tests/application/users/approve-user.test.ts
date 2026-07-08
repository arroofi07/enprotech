import { beforeEach, describe, expect, it, vi } from "vitest";

import { approveUser } from "@/lib/application/users/approve-user";
import type { SessionUser } from "@/lib/domain/auth/types";
import { UserErrorCode } from "@/lib/domain/users/errors";
import * as userRepository from "@/lib/infrastructure/db/repositories/user-repository";

const admin: SessionUser = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "admin@example.com",
  name: "Admin",
  role: "admin",
  status: "active",
};

const targetId = "33333333-3333-4333-8333-333333333333";

const pendingUser = {
  id: targetId,
  email: "user@example.com",
  name: "User",
  role: "student" as const,
  status: "pending" as const,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

describe("approveUser", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("approves pending users", async () => {
    vi.spyOn(userRepository, "findPublicUserById").mockResolvedValue(
      pendingUser,
    );
    vi.spyOn(userRepository, "updateUserStatus").mockResolvedValue({
      ...pendingUser,
      status: "active",
    });

    const result = await approveUser(admin, { userId: targetId });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("active");
    }
  });

  it("rejects approve for active users", async () => {
    vi.spyOn(userRepository, "findPublicUserById").mockResolvedValue({
      ...pendingUser,
      status: "active",
    });

    const result = await approveUser(admin, { userId: targetId });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(UserErrorCode.INVALID_STATUS_TRANSITION);
    }
  });

  it("blocks self modification", async () => {
    const result = await approveUser(admin, { userId: admin.id });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(UserErrorCode.CANNOT_MODIFY_SELF);
    }
  });
});
