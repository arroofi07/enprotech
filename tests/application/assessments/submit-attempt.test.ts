import { beforeEach, describe, expect, it, vi } from "vitest";

import { submitAttemptUseCase } from "@/lib/application/assessments/submit-attempt";
import type { SessionUser } from "@/lib/domain/auth/types";
import { AssessmentErrorCode } from "@/lib/domain/assessments/errors";
import * as assessmentRepository from "@/lib/infrastructure/db/repositories/assessment-repository";
import * as checkModuleAccess from "@/lib/application/modules/check-module-access";

const student: SessionUser = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "student@example.com",
  name: "Student",
  role: "student",
  status: "active",
};

const attemptId = "22222222-2222-4222-8222-222222222222";
const assessmentId = "33333333-3333-4333-8333-333333333333";
const trainingId = "44444444-4444-4444-8444-444444444444";
const moduleId = "55555555-5555-4555-8555-555555555555";

const questions = [
  {
    id: "question-1",
    assessmentId,
    questionText: "Pertanyaan pertama?",
    options: [
      { id: "option-1", text: "Benar", isCorrect: true },
      { id: "option-2", text: "Salah", isCorrect: false },
    ],
    order: 0,
    createdAt: new Date("2026-01-01"),
  },
  {
    id: "question-2",
    assessmentId,
    questionText: "Pertanyaan kedua?",
    options: [
      { id: "option-3", text: "Benar", isCorrect: true },
      { id: "option-4", text: "Salah", isCorrect: false },
    ],
    order: 1,
    createdAt: new Date("2026-01-01"),
  },
];

describe("submitAttemptUseCase", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects an attempt when not every displayed question is answered", async () => {
    vi.spyOn(assessmentRepository, "findAttemptById").mockResolvedValue({
      id: attemptId,
      studentId: student.id,
      assessmentId,
      score: 0,
      answers: [{ questionId: "question-1", selectedOptionId: "option-1" }],
      questionIds: ["question-1", "question-2"],
      startedAt: new Date("2026-01-01"),
      submittedAt: null,
    });
    vi.spyOn(assessmentRepository, "findAssessmentById").mockResolvedValue({
      id: assessmentId,
      trainingId,
      moduleId,
      type: "quiz",
      title: "Quiz Modul",
      passingGrade: 70,
      timeLimit: null,
      maxRetry: null,
      questionDisplayCount: null,
      shuffleQuestions: false,
      createdAt: new Date("2026-01-01"),
    });
    vi.spyOn(
      assessmentRepository,
      "listQuestionsByAssessment",
    ).mockResolvedValue(questions);
    const submitAttempt = vi
      .spyOn(assessmentRepository, "submitAttempt")
      .mockResolvedValue(null);

    const result = await submitAttemptUseCase(student, attemptId);

    expect(result).toEqual({
      success: false,
      error: AssessmentErrorCode.INCOMPLETE_ANSWERS,
      message: "Semua soal harus dijawab sebelum jawaban dapat disubmit.",
    });
    expect(submitAttempt).not.toHaveBeenCalled();
  });

  it("accepts incomplete answers after the time limit expires", async () => {
    vi.spyOn(assessmentRepository, "findAttemptById").mockResolvedValue({
      id: attemptId,
      studentId: student.id,
      assessmentId,
      score: 0,
      answers: [{ questionId: "question-1", selectedOptionId: "option-1" }],
      questionIds: ["question-1", "question-2"],
      startedAt: new Date(Date.now() - 10 * 60_000),
      submittedAt: null,
    });
    vi.spyOn(assessmentRepository, "findAssessmentById").mockResolvedValue({
      id: assessmentId,
      trainingId,
      moduleId,
      type: "quiz",
      title: "Quiz Modul",
      passingGrade: 70,
      timeLimit: 5,
      maxRetry: null,
      questionDisplayCount: null,
      shuffleQuestions: false,
      createdAt: new Date("2026-01-01"),
    });
    vi.spyOn(
      assessmentRepository,
      "listQuestionsByAssessment",
    ).mockResolvedValue(questions);
    vi.spyOn(assessmentRepository, "submitAttempt").mockResolvedValue({
      id: attemptId,
      studentId: student.id,
      assessmentId,
      score: 50,
      answers: [{ questionId: "question-1", selectedOptionId: "option-1" }],
      questionIds: ["question-1", "question-2"],
      startedAt: new Date(Date.now() - 10 * 60_000),
      submittedAt: new Date(),
    });
    vi.spyOn(assessmentRepository, "getTrainingPassingGrade").mockResolvedValue(
      70,
    );
    vi.spyOn(assessmentRepository, "listSubmittedAttempts").mockResolvedValue(
      [],
    );
    vi.spyOn(assessmentRepository, "getBestSubmittedScore").mockResolvedValue(50);
    vi.spyOn(
      checkModuleAccess,
      "tryAutoCompleteModuleAfterAssessmentSubmit",
    ).mockResolvedValue(undefined);

    const result = await submitAttemptUseCase(student, attemptId);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.score).toBe(50);
      expect(result.data.passed).toBe(false);
    }
  });
});
