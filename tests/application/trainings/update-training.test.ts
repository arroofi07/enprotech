import { beforeEach, describe, expect, it, vi } from "vitest";

import { updateTraining } from "@/lib/application/trainings/update-training";
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

const student: SessionUser = {
  ...trainer,
  id: "22222222-2222-4222-8222-222222222222",
  role: "student",
  email: "student@example.com",
  name: "Student",
};

const trainingId = "33333333-3333-4333-8333-333333333333";
const readyPublicationSummary = {
  moduleCount: 2,
  modulesWithContentCount: 2,
  quizQuestionCount: 10,
  modulesWithQuizQuestionsCount: 2,
  latihanQuestionCount: 8,
  modulesWithLatihanQuestionsCount: 2,
  preTestQuestionCount: 5,
  postTestQuestionCount: 5,
  isReadyToPublish: true,
};

describe("updateTraining", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects students", async () => {
    const result = await updateTraining(student, {
      trainingId,
      title: "Updated",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(TrainingErrorCode.FORBIDDEN);
    }
  });

  it("updates training fields", async () => {
    vi.spyOn(trainingRepository, "findTrainingById").mockResolvedValue({
      id: trainingId,
      title: "Safety Training",
      description: null,
      thumbnail: null,
      passingGrade: 70,
      deadline: null,
      status: "draft",
      isPretestActive: false,
      createdBy: trainer.id,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    });
    vi.spyOn(trainingRepository, "updateTraining").mockResolvedValue({
      id: trainingId,
      title: "Updated Training",
      description: "Baru",
      thumbnail: null,
      passingGrade: 80,
      deadline: null,
      status: "draft",
      isPretestActive: false,
      createdBy: trainer.id,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-02"),
    });

    const result = await updateTraining(trainer, {
      trainingId,
      title: "Updated Training",
      description: "Baru",
      passingGrade: 80,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Updated Training");
      expect(result.data.passingGrade).toBe(80);
    }
  });

  it("publishes draft training via status update", async () => {
    vi.spyOn(
      assessmentRepository,
      "getTrainingPublicationSummaries",
    ).mockResolvedValue({
      [trainingId]: readyPublicationSummary,
    });
    vi.spyOn(trainingRepository, "findTrainingById").mockResolvedValue({
      id: trainingId,
      title: "Safety Training",
      description: null,
      thumbnail: null,
      passingGrade: 70,
      deadline: null,
      status: "draft",
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
      status: "active",
      isPretestActive: false,
      createdBy: trainer.id,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-02"),
    });

    const result = await updateTraining(trainer, {
      trainingId,
      status: "active",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("active");
    }
  });

  it("rejects publication while training content is incomplete", async () => {
    vi.spyOn(
      assessmentRepository,
      "getTrainingPublicationSummaries",
    ).mockResolvedValue({
      [trainingId]: {
        ...readyPublicationSummary,
        modulesWithLatihanQuestionsCount: 1,
        isReadyToPublish: false,
      },
    });
    vi.spyOn(trainingRepository, "findTrainingById").mockResolvedValue({
      id: trainingId,
      title: "Safety Training",
      description: null,
      thumbnail: null,
      passingGrade: 70,
      deadline: null,
      status: "draft",
      isPretestActive: false,
      createdBy: trainer.id,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    });
    const updateSpy = vi.spyOn(trainingRepository, "updateTraining");

    const result = await updateTraining(trainer, {
      trainingId,
      status: "active",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(TrainingErrorCode.TRAINING_NOT_READY);
    }
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("publishes an archived training again when content is complete", async () => {
    vi.spyOn(
      assessmentRepository,
      "getTrainingPublicationSummaries",
    ).mockResolvedValue({
      [trainingId]: readyPublicationSummary,
    });
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
    vi.spyOn(trainingRepository, "updateTraining").mockResolvedValue({
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
      updatedAt: new Date("2026-01-02"),
    });

    const result = await updateTraining(trainer, {
      trainingId,
      status: "active",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("active");
    }
  });

  it("rejects pre-test activation through update", async () => {
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

    const result = await updateTraining(trainer, {
      trainingId,
      isPretestActive: true,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(TrainingErrorCode.VALIDATION_ERROR);
    }
  });
});
