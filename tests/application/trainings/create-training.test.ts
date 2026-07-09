import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTraining } from "@/lib/application/trainings/create-training";
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

const student: SessionUser = {
  ...trainer,
  id: "22222222-2222-4222-8222-222222222222",
  role: "student",
  email: "student@example.com",
  name: "Student",
};

const trainingRecord = {
  id: "33333333-3333-4333-8333-333333333333",
  title: "Safety Training",
  description: "Deskripsi",
  thumbnail: null,
  passingGrade: 70,
  deadline: null,
  status: "draft" as const,
  isPretestActive: false,
  createdBy: trainer.id,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

describe("createTraining", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects unauthenticated actors", async () => {
    const result = await createTraining(null, {
      title: "Safety Training",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(TrainingErrorCode.UNAUTHORIZED);
    }
  });

  it("rejects students", async () => {
    const result = await createTraining(student, {
      title: "Safety Training",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(TrainingErrorCode.FORBIDDEN);
    }
  });

  it("creates training for trainer", async () => {
    vi.spyOn(trainingRepository, "createTraining").mockResolvedValue(
      trainingRecord,
    );

    const result = await createTraining(trainer, {
      title: "Safety Training",
      passingGrade: 80,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Safety Training");
    }

    expect(trainingRepository.createTraining).toHaveBeenCalledWith({
      title: "Safety Training",
      passingGrade: 80,
      deadline: null,
      createdBy: trainer.id,
    });
  });
});
