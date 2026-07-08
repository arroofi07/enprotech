import { beforeEach, describe, expect, it, vi } from "vitest";

import { setUserStatus } from "@/lib/application/users/set-user-status";
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

describe("setUserStatus", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("deactivates active users", async () => {
    vi.spyOn(userRepository, "findPublicUserById").mockResolvedValue({
      id: targetId,
      email: "user@example.com",
      name: "User",
      role: "student",
      status: "active",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    });
    vi.spyOn(userRepository, "updateUserStatus").mockResolvedValue({
      id: targetId,
      email: "user@example.com",
      name: "User",
      role: "student",
      status: "inactive",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    });

    const result = await setUserStatus(admin, {
      userId: targetId,
      status: "inactive",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("inactive");
    }
  });

  it("reactivates inactive users", async () => {
    vi.spyOn(userRepository, "findPublicUserById").mockResolvedValue({
      id: targetId,
      email: "user@example.com",
      name: "User",
      role: "student",
      status: "inactive",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    });
    vi.spyOn(userRepository, "updateUserStatus").mockResolvedValue({
      id: targetId,
      email: "user@example.com",
      name: "User",
      role: "student",
      status: "active",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    });

    const result = await setUserStatus(admin, {
      userId: targetId,
      status: "active",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("active");
    }
  });

  it("protects last active admin from deactivation", async () => {
    vi.spyOn(userRepository, "findPublicUserById").mockResolvedValue({
      id: targetId,
      email: "other-admin@example.com",
      name: "Other Admin",
      role: "admin",
      status: "active",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    });
    vi.spyOn(userRepository, "countActiveAdmins").mockResolvedValue(1);

    const result = await setUserStatus(admin, {
      userId: targetId,
      status: "inactive",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(UserErrorCode.LAST_ADMIN_PROTECTED);
    }
  });

  it("blocks self status change", async () => {
    const result = await setUserStatus(admin, {
      userId: admin.id,
      status: "inactive",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(UserErrorCode.CANNOT_MODIFY_SELF);
    }
  });
});
