import { beforeEach, describe, expect, it, vi } from "vitest";

import { listEnrolledTrainings } from "@/lib/application/trainings/list-enrolled-trainings";
import type { SessionUser } from "@/lib/domain/auth/types";
import { TrainingErrorCode } from "@/lib/domain/trainings/errors";
import * as progressApplication from "@/lib/application/progress/enrich-enrolled-trainings";
import * as trainingRepository from "@/lib/infrastructure/db/repositories/training-repository";

const student: SessionUser = {
  id: "22222222-2222-4222-8222-222222222222",
  email: "student@example.com",
  name: "Student",
  role: "student",
  status: "active",
};

const trainer: SessionUser = {
  ...student,
  id: "11111111-1111-4111-8111-111111111111",
  role: "trainer",
  email: "trainer@example.com",
  name: "Trainer",
};

describe("listEnrolledTrainings", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects trainers", async () => {
    const result = await listEnrolledTrainings(trainer);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(TrainingErrorCode.FORBIDDEN);
    }
  });

  it("returns enrolled trainings for student", async () => {
    const baseTraining = {
      id: "33333333-3333-4333-8333-333333333333",
      title: "Safety Training",
      description: null,
      thumbnail: null,
      passingGrade: 70,
      deadline: null,
      status: "active" as const,
      isPretestActive: false,
      createdBy: trainer.id,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
      enrollmentId: "44444444-4444-4444-8444-444444444444",
      enrollmentStatus: "enrolled" as const,
      enrolledAt: new Date("2026-01-02"),
    };

    vi.spyOn(
      trainingRepository,
      "listEnrolledTrainingsByStudent",
    ).mockResolvedValue({ items: [baseTraining], total: 1 });

    vi.spyOn(
      progressApplication,
      "enrichEnrolledTrainingsWithProgress",
    ).mockResolvedValue([
      {
        ...baseTraining,
        progressPercent: 0,
        completedModules: 0,
        totalModules: 0,
        completedQuizzes: 0,
        totalQuizzes: 0,
        completedLatihans: 0,
        totalLatihans: 0,
        completedItems: 0,
        totalItems: 0,
      },
    ]);

    const result = await listEnrolledTrainings(student);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toHaveLength(1);
      expect(result.data.items[0].progressPercent).toBe(0);
    }
  });
});
