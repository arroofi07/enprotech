import { beforeEach, describe, expect, it, vi } from "vitest";

import { activatePretest } from "@/lib/application/trainings/activate-pretest";
import type { SessionUser } from "@/lib/domain/auth/types";
import { TrainingErrorCode } from "@/lib/domain/trainings/errors";
import * as assessmentRepository from "@/lib/infrastructure/db/repositories/assessment-repository";
import * as trainingRepository from "@/lib/infrastructure/db/repositories/training-repository";

const trainer: SessionUser = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "trainer@example.com",
  name: "Trainer",
  role: "trainer",
  status: "active",
};

const trainingId = "33333333-3333-4333-8333-333333333333";

describe("activatePretest", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("activates pre-test when modules are ready", async () => {
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
    vi.spyOn(trainingRepository, "areAllModulesReady").mockResolvedValue(true);
    vi.spyOn(
      assessmentRepository,
      "findAssessmentByTrainingAndType",
    ).mockResolvedValue({
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      trainingId,
      moduleId: null,
      type: "pre_test",
      title: "Pre-Test — Safety Training",
      passingGrade: null,
      timeLimit: null,
      maxRetry: 1,
      questionDisplayCount: null,
      shuffleQuestions: false,
      createdAt: new Date("2026-01-01"),
    });
    vi.spyOn(assessmentRepository, "countQuestionsByAssessment").mockResolvedValue(
      5,
    );
    vi.spyOn(trainingRepository, "setPretestActive").mockResolvedValue({
      id: trainingId,
      title: "Safety Training",
      description: null,
      thumbnail: null,
      passingGrade: 70,
      deadline: null,
      status: "active",
      isPretestActive: true,
      createdBy: trainer.id,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    });

    const result = await activatePretest(trainer, { trainingId });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isPretestActive).toBe(true);
    }
  });

  it("rejects when modules are not ready", async () => {
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
    vi.spyOn(trainingRepository, "areAllModulesReady").mockResolvedValue(false);

    const result = await activatePretest(trainer, { trainingId });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(TrainingErrorCode.MODULES_NOT_READY);
    }
  });

  it("rejects when pre-test is already active", async () => {
    vi.spyOn(trainingRepository, "findTrainingById").mockResolvedValue({
      id: trainingId,
      title: "Safety Training",
      description: null,
      thumbnail: null,
      passingGrade: 70,
      deadline: null,
      status: "active",
      isPretestActive: true,
      createdBy: trainer.id,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    });

    const result = await activatePretest(trainer, { trainingId });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(TrainingErrorCode.PRETEST_ALREADY_ACTIVE);
    }
  });
});
