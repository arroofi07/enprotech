import { beforeEach, describe, expect, it, vi } from "vitest";

import { registerUser } from "@/lib/application/auth/register-user";
import { AuthErrorCode } from "@/lib/domain/auth/errors";
import * as passwordHasher from "@/lib/infrastructure/auth/password-hasher";
import * as userRepository from "@/lib/infrastructure/db/repositories/user-repository";

describe("registerUser", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("creates pending student account", async () => {
    vi.spyOn(userRepository, "findUserByEmail").mockResolvedValue(null);
    vi.spyOn(passwordHasher, "hashPassword").mockResolvedValue("hashed-password");
    const createUserSpy = vi
      .spyOn(userRepository, "createUser")
      .mockResolvedValue({
        id: "user-1",
        email: "new@example.com",
        passwordHash: "hashed-password",
        name: "New User",
        role: "student",
        status: "pending",
      });

    const result = await registerUser({
      name: "New User",
      email: "new@example.com",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(result.success).toBe(true);
    expect(createUserSpy).toHaveBeenCalledWith({
      name: "New User",
      email: "new@example.com",
      passwordHash: "hashed-password",
      role: "student",
      status: "pending",
    });
  });

  it("rejects duplicate email", async () => {
    vi.spyOn(userRepository, "findUserByEmail").mockResolvedValue({
      id: "existing",
      email: "existing@example.com",
      passwordHash: "hash",
      name: "Existing",
      role: "student",
      status: "active",
    });

    const result = await registerUser({
      name: "Another",
      email: "existing@example.com",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(AuthErrorCode.EMAIL_EXISTS);
    }
  });
});
