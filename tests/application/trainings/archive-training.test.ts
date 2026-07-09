import { beforeEach, describe, expect, it, vi } from "vitest";

import { archiveTraining } from "@/lib/application/trainings/archive-training";
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

describe("archiveTraining", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("archives an active training", async () => {
    vi.spyOn(trainingRepository, "findTrainingById").mockResolvedValue({
      id: trainingId,
      title: "Safety Training",
      description: null,
      thumbnail: null,
      passingGrade: 70,
      deadline: null,
      status: "active",
      isPretestActive: false,
      createdBy: trainer.id,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    });
    vi.spyOn(trainingRepository, "updateTraining").mockResolvedValue({
      id: trainingId,
      title: "Safety Training",
      description: null,
      thumbnail: null,
      passingGrade: 70,
      deadline: null,
      status: "archived",
      isPretestActive: false,
      createdBy: trainer.id,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    });

    const result = await archiveTraining(trainer, { trainingId });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("archived");
    }
  });

  it("rejects archiving an already archived training", async () => {
    vi.spyOn(trainingRepository, "findTrainingById").mockResolvedValue({
      id: trainingId,
      title: "Safety Training",
      description: null,
      thumbnail: null,
      passingGrade: 70,
      deadline: null,
      status: "archived",
      isPretestActive: false,
      createdBy: trainer.id,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    });

    const result = await archiveTraining(trainer, { trainingId });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(TrainingErrorCode.INVALID_STATUS_TRANSITION);
    }
  });
});
