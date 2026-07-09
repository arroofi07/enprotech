import { beforeEach, describe, expect, it, vi } from "vitest";

import { listEnrollableStudents } from "@/lib/application/trainings/list-enrollable-students";
import type { SessionUser } from "@/lib/domain/auth/types";
import { TrainingErrorCode } from "@/lib/domain/trainings/errors";
import * as userRepository from "@/lib/infrastructure/db/repositories/user-repository";

const trainer: SessionUser = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "trainer@example.com",
  name: "Trainer",
  role: "trainer",
  status: "active",
};

const student: SessionUser = {
  ...trainer,
  id: "22222222-2222-4222-8222-222222222222",
  role: "student",
  email: "student@example.com",
  name: "Student",
};

describe("listEnrollableStudents", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns active students for trainer", async () => {
    vi.spyOn(userRepository, "listActiveStudents").mockResolvedValue([
      {
        id: "44444444-4444-4444-8444-444444444444",
        email: "student@example.com",
        name: "Student A",
        role: "student",
        status: "active",
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
      },
    ]);

    const result = await listEnrollableStudents(trainer);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
    }
  });

  it("rejects students", async () => {
    const result = await listEnrollableStudents(student);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(TrainingErrorCode.FORBIDDEN);
    }
  });
});
