import { beforeEach, describe, expect, it, vi } from "vitest";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import * as sessionManager from "@/lib/infrastructure/auth/session-manager";
import * as userRepository from "@/lib/infrastructure/db/repositories/user-repository";

describe("getCurrentUser", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null without session", async () => {
    vi.spyOn(sessionManager, "getSession").mockResolvedValue(null);
    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it("returns null when user is inactive", async () => {
    vi.spyOn(sessionManager, "getSession").mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      name: "User",
      role: "student",
      status: "active",
    });
    vi.spyOn(userRepository, "findUserById").mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      passwordHash: "hash",
      name: "User",
      role: "student",
      status: "inactive",
    });

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it("returns fresh user data when active", async () => {
    vi.spyOn(sessionManager, "getSession").mockResolvedValue({
      id: "user-1",
      email: "old@example.com",
      name: "Old",
      role: "student",
      status: "active",
    });
    vi.spyOn(userRepository, "findUserById").mockResolvedValue({
      id: "user-1",
      email: "fresh@example.com",
      passwordHash: "hash",
      name: "Fresh",
      role: "trainer",
      status: "active",
    });

    await expect(getCurrentUser()).resolves.toEqual({
      id: "user-1",
      email: "fresh@example.com",
      name: "Fresh",
      role: "trainer",
      status: "active",
    });
  });

  it("falls back to session when database is temporarily unreachable", async () => {
    const session = {
      id: "user-1",
      email: "user@example.com",
      name: "User",
      role: "trainer" as const,
      status: "active" as const,
    };

    vi.spyOn(sessionManager, "getSession").mockResolvedValue(session);
    vi.spyOn(userRepository, "findUserById").mockRejectedValue({
      cause: { code: "CONNECT_TIMEOUT" },
    });

    await expect(getCurrentUser()).resolves.toEqual(session);
  });
});
