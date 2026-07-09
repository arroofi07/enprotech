import { beforeEach, describe, expect, it, vi } from "vitest";

import { getTraining } from "@/lib/application/trainings/get-training";
import type { SessionUser } from "@/lib/domain/auth/types";
import { TrainingErrorCode } from "@/lib/domain/trainings/errors";
import * as trainingRepository from "@/lib/infrastructure/db/repositories/training-repository";

const trainer: SessionUser = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "trainer@example.com",
  name: "Trainer",
  role: "trainer",
  status: "active",
};

const trainingId = "33333333-3333-4333-8333-333333333333";

const trainingRecord = {
  id: trainingId,
  title: "Safety Training",
  description: "Deskripsi",
  thumbnail: null,
  passingGrade: 70,
  deadline: null,
  status: "active" as const,
  isPretestActive: false,
  createdBy: trainer.id,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

describe("getTraining", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns training detail with enrollments", async () => {
    vi.spyOn(trainingRepository, "findTrainingById").mockResolvedValue(
      trainingRecord,
    );
    vi.spyOn(trainingRepository, "listEnrollmentsByTraining").mockResolvedValue([
      {
        id: "55555555-5555-4555-8555-555555555555",
        studentId: "44444444-4444-4444-8444-444444444444",
        trainingId,
        status: "enrolled",
        enrolledAt: new Date("2026-01-02"),
        completedAt: null,
        studentName: "Student A",
        studentEmail: "student@example.com",
      },
    ]);

    const result = await getTraining(trainer, { trainingId });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Safety Training");
      expect(result.data.enrollments).toHaveLength(1);
    }
  });

  it("returns not found when training is missing", async () => {
    vi.spyOn(trainingRepository, "findTrainingById").mockResolvedValue(null);

    const result = await getTraining(trainer, { trainingId });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(TrainingErrorCode.TRAINING_NOT_FOUND);
    }
  });
});
