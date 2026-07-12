import { describe, expect, it } from "vitest";

import { buildLatestAttemptReview } from "@/lib/application/assessments/build-latest-attempt-review";
import type {
  AssessmentAttemptRecord,
  AssessmentRecord,
  QuestionRecord,
} from "@/lib/infrastructure/db/repositories/assessment-repository";

const assessment: AssessmentRecord = {
  id: "assessment-1",
  trainingId: "training-1",
  moduleId: "module-1",
  type: "quiz",
  passingGrade: 70,
  maxRetry: 3,
  questionDisplayCount: null,
  shuffleQuestions: false,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

const questions: QuestionRecord[] = [
  {
    id: "q1",
    assessmentId: assessment.id,
    questionText: "Soal 1",
    options: [
      { id: "a", text: "Benar", isCorrect: true },
      { id: "b", text: "Salah", isCorrect: false },
    ],
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
  {
    id: "q2",
    assessmentId: assessment.id,
    questionText: "Soal 2",
    options: [
      { id: "c", text: "Benar", isCorrect: true },
      { id: "d", text: "Salah", isCorrect: false },
    ],
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
];

const submittedAttempt: AssessmentAttemptRecord = {
  id: "attempt-1",
  studentId: "student-1",
  assessmentId: assessment.id,
  score: 50,
  answers: [
    { questionId: "q1", selectedOptionId: "b" },
    { questionId: "q2", selectedOptionId: "c" },
  ],
  questionIds: ["q1", "q2"],
  startedAt: new Date("2026-01-01"),
  submittedAt: new Date("2026-01-02"),
};

describe("buildLatestAttemptReview", () => {
  it("returns null when there is no submitted attempt", () => {
    expect(
      buildLatestAttemptReview(questions, assessment, null, 70, 0),
    ).toBeNull();
  });

  it("rebuilds wrong answer review from persisted attempt data", () => {
    const review = buildLatestAttemptReview(
      questions,
      assessment,
      submittedAttempt,
      70,
      50,
    );

    expect(review).toEqual({
      score: 50,
      passingGrade: 70,
      passed: false,
      bestScore: 50,
      wrongAnswers: [
        {
          questionId: "q1",
          questionText: "Soal 1",
          selectedOptionId: "b",
          selectedOptionText: "Salah",
          correctOptionId: "a",
          correctOptionText: "Benar",
        },
      ],
    });
  });
});
