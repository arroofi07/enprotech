import { beforeEach, describe, expect, it, vi } from "vitest";

import { listTrainings } from "@/lib/application/trainings/list-trainings";
import type { SessionUser } from "@/lib/domain/auth/types";
import { TrainingErrorCode } from "@/lib/domain/trainings/errors";
import * as trainingRepository from "@/lib/infrastructure/db/repositories/training-repository";

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

describe("listTrainings", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects students", async () => {
    const result = await listTrainings(student, {});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(TrainingErrorCode.FORBIDDEN);
    }
  });

  it("returns paginated trainings for admin", async () => {
    vi.spyOn(trainingRepository, "listTrainings").mockResolvedValue({
      items: [
        {
          id: "33333333-3333-4333-8333-333333333333",
          title: "Safety Training",
          description: null,
          thumbnail: null,
          passingGrade: 70,
          deadline: null,
          status: "draft",
          isPretestActive: false,
          createdBy: admin.id,
          createdAt: new Date("2026-01-01"),
          updatedAt: new Date("2026-01-01"),
        },
      ],
      total: 1,
    });

    const result = await listTrainings(admin, {
      search: "Safety",
      page: 1,
      pageSize: 10,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toHaveLength(1);
      expect(result.data.totalPages).toBe(1);
    }
  });
});
