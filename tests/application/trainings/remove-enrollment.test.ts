import { beforeEach, describe, expect, it, vi } from "vitest";

import { removeEnrollment } from "@/lib/application/trainings/remove-enrollment";
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
const enrollmentId = "55555555-5555-4555-8555-555555555555";

describe("removeEnrollment", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("removes enrollment from active training", async () => {
    vi.spyOn(trainingRepository, "findEnrollmentById").mockResolvedValue({
      id: enrollmentId,
      studentId: "44444444-4444-4444-8444-444444444444",
      trainingId,
      status: "enrolled",
      enrolledAt: new Date("2026-01-02"),
      completedAt: null,
      studentName: "Student A",
      studentEmail: "student@example.com",
    });
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
    vi.spyOn(trainingRepository, "removeEnrollment").mockResolvedValue(true);

    const result = await removeEnrollment(trainer, { enrollmentId });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.enrollmentId).toBe(enrollmentId);
    }
  });

  it("rejects removal from archived training", async () => {
    vi.spyOn(trainingRepository, "findEnrollmentById").mockResolvedValue({
      id: enrollmentId,
      studentId: "44444444-4444-4444-8444-444444444444",
      trainingId,
      status: "enrolled",
      enrolledAt: new Date("2026-01-02"),
      completedAt: null,
      studentName: "Student A",
      studentEmail: "student@example.com",
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

    const result = await removeEnrollment(trainer, { enrollmentId });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(TrainingErrorCode.INVALID_STATUS_TRANSITION);
    }
  });

  it("returns not found for missing enrollment", async () => {
    vi.spyOn(trainingRepository, "findEnrollmentById").mockResolvedValue(null);

    const result = await removeEnrollment(trainer, { enrollmentId });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(TrainingErrorCode.ENROLLMENT_NOT_FOUND);
    }
  });
});
