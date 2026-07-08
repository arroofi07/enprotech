import { beforeEach, describe, expect, it, vi } from "vitest";

import { listUsers } from "@/lib/application/users/list-users";
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

const student: SessionUser = {
  ...admin,
  id: "22222222-2222-4222-8222-222222222222",
  role: "student",
  email: "student@example.com",
  name: "Student",
};

describe("listUsers", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects non-admin actors", async () => {
    const result = await listUsers(student, {});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(UserErrorCode.FORBIDDEN);
    }
  });

  it("rejects unauthenticated actors", async () => {
    const result = await listUsers(null, {});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(UserErrorCode.UNAUTHORIZED);
    }
  });

  it("returns paginated users for admin", async () => {
    vi.spyOn(userRepository, "listUsers").mockResolvedValue({
      items: [
        {
          id: "33333333-3333-4333-8333-333333333333",
          email: "user@example.com",
          name: "User",
          role: "student",
          status: "pending",
          createdAt: new Date("2026-01-01"),
          updatedAt: new Date("2026-01-01"),
        },
      ],
      total: 1,
    });

    const result = await listUsers(admin, {
      search: "user",
      status: "pending",
      page: 1,
      pageSize: 10,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toHaveLength(1);
      expect(result.data.total).toBe(1);
      expect(result.data.totalPages).toBe(1);
    }
  });
});
