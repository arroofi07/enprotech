import { beforeEach, describe, expect, it, vi } from "vitest";

import { loginUser } from "@/lib/application/auth/login-user";
import { AuthErrorCode } from "@/lib/domain/auth/errors";
import * as passwordHasher from "@/lib/infrastructure/auth/password-hasher";
import * as userRepository from "@/lib/infrastructure/db/repositories/user-repository";

describe("loginUser", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns session data for valid active user", async () => {
    vi.spyOn(userRepository, "findUserByEmail").mockResolvedValue({
      id: "user-1",
      email: "student@example.com",
      passwordHash: "hashed",
      name: "Student",
      role: "student",
      status: "active",
    });
    vi.spyOn(passwordHasher, "verifyPassword").mockResolvedValue(true);

    const result = await loginUser({
      email: "student@example.com",
      password: "password123",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.redirectTo).toBe("/student/dashboard");
      expect(result.data.user.role).toBe("student");
    }
  });

  it("rejects invalid credentials", async () => {
    vi.spyOn(userRepository, "findUserByEmail").mockResolvedValue(null);

    const result = await loginUser({
      email: "missing@example.com",
      password: "password123",
    });

    expect(result).toEqual({
      success: false,
      error: AuthErrorCode.INVALID_CREDENTIALS,
      message: "Email atau password salah.",
    });
  });

  it("rejects pending users", async () => {
    vi.spyOn(userRepository, "findUserByEmail").mockResolvedValue({
      id: "user-2",
      email: "pending@example.com",
      passwordHash: "hashed",
      name: "Pending",
      role: "student",
      status: "pending",
    });
    vi.spyOn(passwordHasher, "verifyPassword").mockResolvedValue(true);

    const result = await loginUser({
      email: "pending@example.com",
      password: "password123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(AuthErrorCode.PENDING_APPROVAL);
    }
  });

  it("rejects inactive users", async () => {
    vi.spyOn(userRepository, "findUserByEmail").mockResolvedValue({
      id: "user-3",
      email: "inactive@example.com",
      passwordHash: "hashed",
      name: "Inactive",
      role: "student",
      status: "inactive",
    });
    vi.spyOn(passwordHasher, "verifyPassword").mockResolvedValue(true);

    const result = await loginUser({
      email: "inactive@example.com",
      password: "password123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(AuthErrorCode.ACCOUNT_INACTIVE);
    }
  });
});
