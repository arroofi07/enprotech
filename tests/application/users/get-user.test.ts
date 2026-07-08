import { beforeEach, describe, expect, it, vi } from "vitest";

import { getUser } from "@/lib/application/users/get-user";
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

describe("getUser", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns user detail for admin", async () => {
    vi.spyOn(userRepository, "findPublicUserById").mockResolvedValue({
      id: targetId,
      email: "user@example.com",
      name: "User",
      role: "student",
      status: "pending",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    });

    const result = await getUser(admin, { userId: targetId });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
    }
  });

  it("returns not found when missing", async () => {
    vi.spyOn(userRepository, "findPublicUserById").mockResolvedValue(null);

    const result = await getUser(admin, { userId: targetId });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(UserErrorCode.USER_NOT_FOUND);
    }
  });
});
