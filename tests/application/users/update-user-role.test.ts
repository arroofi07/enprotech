import { beforeEach, describe, expect, it, vi } from "vitest";

import { updateUserRole } from "@/lib/application/users/update-user-role";
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

describe("updateUserRole", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("updates role for non-admin users", async () => {
    vi.spyOn(userRepository, "findPublicUserById").mockResolvedValue({
      id: targetId,
      email: "user@example.com",
      name: "User",
      role: "student",
      status: "active",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    });
    vi.spyOn(userRepository, "updateUserRole").mockResolvedValue({
      id: targetId,
      email: "user@example.com",
      name: "User",
      role: "trainer",
      status: "active",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    });

    const result = await updateUserRole(admin, {
      userId: targetId,
      role: "trainer",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.role).toBe("trainer");
    }
  });

  it("protects last active admin from demotion", async () => {
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

    const result = await updateUserRole(admin, {
      userId: targetId,
      role: "student",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(UserErrorCode.LAST_ADMIN_PROTECTED);
    }
  });

  it("blocks self role change", async () => {
    const result = await updateUserRole(admin, {
      userId: admin.id,
      role: "student",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(UserErrorCode.CANNOT_MODIFY_SELF);
    }
  });
});
