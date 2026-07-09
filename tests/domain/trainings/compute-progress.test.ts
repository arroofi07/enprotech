import { describe, expect, it } from "vitest";

import {
  buildAssessmentProgressItem,
  buildTrainingProgressSummary,
  calculateTrainingProgress,
  countCompletedModules,
  isAssessmentProgressComplete,
  resolveAssessmentProgressStatus,
} from "@/lib/domain/trainings/compute-progress";
import type { ModuleProgressItem } from "@/lib/domain/trainings/progress-types";

describe("calculateTrainingProgress", () => {
  it("returns 0 when there are no items", () => {
    expect(calculateTrainingProgress(0, 0)).toBe(0);
  });

  it("calculates rounded percentage", () => {
    expect(calculateTrainingProgress(4, 1)).toBe(25);
    expect(calculateTrainingProgress(3, 2)).toBe(67);
  });

  it("caps progress at 100", () => {
    expect(calculateTrainingProgress(2, 5)).toBe(100);
  });
});

describe("countCompletedModules", () => {
  it("counts only completed module progress rows", () => {
    expect(
      countCompletedModules([
        { status: "completed" },
        { status: "in_progress" },
        { status: "completed" },
        { status: "not_started" },
      ]),
    ).toBe(2);
  });
});

describe("resolveAssessmentProgressStatus", () => {
  it("returns locked when assessment is locked", () => {
    expect(
      resolveAssessmentProgressStatus({
        locked: true,
        submittedCount: 0,
        hasInProgressAttempt: false,
        hasPassed: false,
        requirePass: true,
      }),
    ).toBe("locked");
  });

  it("treats submitted pre-test as passed when pass is not required", () => {
    expect(
      resolveAssessmentProgressStatus({
        locked: false,
        submittedCount: 1,
        hasInProgressAttempt: false,
        hasPassed: false,
        requirePass: false,
      }),
    ).toBe("passed");
  });

  it("returns submitted when attempt exists but pass is required", () => {
    expect(
      resolveAssessmentProgressStatus({
        locked: false,
        submittedCount: 1,
        hasInProgressAttempt: false,
        hasPassed: false,
        requirePass: true,
      }),
    ).toBe("submitted");
  });
});

describe("buildTrainingProgressSummary", () => {
  const baseModule = (
    overrides: Partial<ModuleProgressItem> = {},
  ): ModuleProgressItem => ({
    id: "module-1",
    title: "Modul 1",
    order: 0,
    status: "not_started",
    quiz: buildAssessmentProgressItem({
      assessmentId: "quiz-1",
      bestScore: null,
      passingGrade: 70,
      submittedCount: 0,
      hasInProgressAttempt: false,
      locked: false,
      requirePass: true,
    }),
    latihan: buildAssessmentProgressItem({
      assessmentId: "latihan-1",
      bestScore: null,
      passingGrade: 70,
      submittedCount: 0,
      hasInProgressAttempt: false,
      locked: false,
      requirePass: true,
    }),
    ...overrides,
  });

  it("counts all training items in total", () => {
    const summary = buildTrainingProgressSummary({
      modules: [baseModule(), baseModule({ id: "module-2", order: 1 })],
      preTest: buildAssessmentProgressItem({
        assessmentId: "pre",
        bestScore: null,
        passingGrade: 70,
        submittedCount: 0,
        hasInProgressAttempt: false,
        locked: false,
        requirePass: false,
      }),
      postTest: buildAssessmentProgressItem({
        assessmentId: "post",
        bestScore: null,
        passingGrade: 70,
        submittedCount: 0,
        hasInProgressAttempt: false,
        locked: true,
        requirePass: true,
      }),
    });

    expect(summary.totalItems).toBe(8);
    expect(summary.completedItems).toBe(0);
    expect(summary.progressPercent).toBe(0);
  });

  it("counts completed module, quiz, latihan, and assessments", () => {
    const passedQuiz = buildAssessmentProgressItem({
      assessmentId: "quiz-1",
      bestScore: 80,
      passingGrade: 70,
      submittedCount: 1,
      hasInProgressAttempt: false,
      locked: false,
      requirePass: true,
    });
    const passedLatihan = buildAssessmentProgressItem({
      assessmentId: "latihan-1",
      bestScore: 75,
      passingGrade: 70,
      submittedCount: 1,
      hasInProgressAttempt: false,
      locked: false,
      requirePass: true,
    });

    const summary = buildTrainingProgressSummary({
      modules: [
        baseModule({
          status: "completed",
          quiz: passedQuiz,
          latihan: passedLatihan,
        }),
      ],
      preTest: buildAssessmentProgressItem({
        assessmentId: "pre",
        bestScore: 60,
        passingGrade: 70,
        submittedCount: 1,
        hasInProgressAttempt: false,
        locked: false,
        requirePass: false,
      }),
      postTest: buildAssessmentProgressItem({
        assessmentId: "post",
        bestScore: 85,
        passingGrade: 70,
        submittedCount: 1,
        hasInProgressAttempt: false,
        locked: false,
        requirePass: true,
      }),
    });

    expect(summary.modules).toEqual({ completed: 1, total: 1 });
    expect(summary.quizzes).toEqual({ completed: 1, total: 1 });
    expect(summary.latihans).toEqual({ completed: 1, total: 1 });
    expect(isAssessmentProgressComplete(summary.preTest.status)).toBe(true);
    expect(isAssessmentProgressComplete(summary.postTest.status)).toBe(true);
    expect(summary.completedItems).toBe(5);
    expect(summary.progressPercent).toBe(100);
  });
});
