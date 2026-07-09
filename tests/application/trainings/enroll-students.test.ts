import { beforeEach, describe, expect, it, vi } from "vitest";

import { enrollStudents } from "@/lib/application/trainings/enroll-students";
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
const studentId = "44444444-4444-4444-8444-444444444444";

describe("enrollStudents", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("enrolls active students", async () => {
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
    vi.spyOn(trainingRepository, "countActiveStudentsByIds").mockResolvedValue(1);
    vi.spyOn(
      trainingRepository,
      "findExistingEnrollmentStudentIds",
    ).mockResolvedValue([]);
    vi.spyOn(trainingRepository, "enrollStudents").mockResolvedValue([
      {
        id: "55555555-5555-4555-8555-555555555555",
        studentId,
        trainingId,
        status: "enrolled",
        enrolledAt: new Date("2026-01-02"),
        completedAt: null,
        studentName: "Student A",
        studentEmail: "student@example.com",
      },
    ]);

    const result = await enrollStudents(trainer, {
      trainingId,
      studentIds: [studentId],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
    }
  });

  it("rejects when all students are already enrolled", async () => {
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
    vi.spyOn(trainingRepository, "countActiveStudentsByIds").mockResolvedValue(1);
    vi.spyOn(
      trainingRepository,
      "findExistingEnrollmentStudentIds",
    ).mockResolvedValue([studentId]);

    const result = await enrollStudents(trainer, {
      trainingId,
      studentIds: [studentId],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(TrainingErrorCode.ALREADY_ENROLLED);
    }
  });

  it("rejects inactive or missing students", async () => {
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
    vi.spyOn(trainingRepository, "countActiveStudentsByIds").mockResolvedValue(0);

    const result = await enrollStudents(trainer, {
      trainingId,
      studentIds: [studentId],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(TrainingErrorCode.STUDENT_NOT_FOUND);
    }
  });
});
