import "dotenv/config";

import * as XLSX from "xlsx";

import { getOrCreateAssessment } from "@/lib/application/assessments/get-or-create-assessment";
import { createModule } from "@/lib/application/modules/create-module";
import { createTraining } from "@/lib/application/trainings/create-training";
import { updateTraining } from "@/lib/application/trainings/update-training";
import { hashPassword } from "@/lib/infrastructure/auth/password-hasher";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
} from "@/lib/infrastructure/auth/session-manager";
import {
  createUser,
  findUserByEmail,
} from "@/lib/infrastructure/db/repositories/user-repository";

const BASE_URL = process.env.QA_BASE_URL ?? "http://localhost:3000";

type QaResult = { id: string; label: string; passed: boolean; detail: string };
const results: QaResult[] = [];

function record(id: string, label: string, passed: boolean, detail: string) {
  results.push({ id, label, passed, detail });
  console.log(`[${passed ? "PASS" : "FAIL"}] ${id} ${label} — ${detail}`);
}

function buildWorkbook(rows: Record<string, string | number>[]) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  return XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
}

async function ensureUser(input: {
  email: string;
  name: string;
  role: "trainer" | "student";
}) {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    return existing;
  }

  const passwordHash = await hashPassword("QaTest123!");
  return createUser({
    email: input.email,
    name: input.name,
    passwordHash,
    role: input.role,
    status: "active",
  });
}

async function fetchWithSession(
  path: string,
  user: { id: string; email: string; name: string; role: "trainer" | "student" },
  init?: RequestInit,
) {
  const token = await createSessionToken({ ...user, status: "active" });
  const headers = new Headers(init?.headers);
  headers.set("Cookie", `${SESSION_COOKIE_NAME}=${token}`);
  return fetch(`${BASE_URL}${path}`, { ...init, headers, redirect: "manual" });
}

async function main() {
  console.log("=== T11 Manual QA Runner ===\n");

  const trainer = await ensureUser({
    email: "qa-t11-trainer@enprotech.test",
    name: "QA T11 Trainer",
    role: "trainer",
  });
  const student = await ensureUser({
    email: "qa-t11-student@enprotech.test",
    name: "QA T11 Student",
    role: "student",
  });

  const training = await createTraining(trainer, {
    title: `QA Import Training ${Date.now()}`,
    passingGrade: 70,
    deadline: null,
  });
  if (!training.success) {
    throw new Error(training.message);
  }

  const trainingId = training.data.id;
  await updateTraining(trainer, { trainingId, status: "active" });

  const moduleResult = await createModule(trainer, {
    trainingId,
    title: "QA Import Module",
    materialUrl: "https://example.com/materi.pdf",
    materialSize: 1024,
  });
  if (!moduleResult.success) {
    throw new Error(moduleResult.message);
  }

  const quiz = await getOrCreateAssessment(trainer, {
    moduleId: moduleResult.data.id,
    type: "quiz",
  });
  if (!quiz.success) {
    throw new Error(quiz.message);
  }

  const templateQuestions = await fetchWithSession(
    "/api/import/templates/questions",
    trainer,
  );
  record(
    "AC-1a",
    "Download questions template",
    templateQuestions.status === 200,
    `status=${templateQuestions.status}`,
  );

  const templateEnrollments = await fetchWithSession(
    "/api/import/templates/enrollments",
    trainer,
  );
  record(
    "AC-1b",
    "Download enrollments template",
    templateEnrollments.status === 200,
    `status=${templateEnrollments.status}`,
  );

  const questionsBuffer = buildWorkbook([
    {
      question: "QA import question?",
      option_a: "A",
      option_b: "B",
      option_c: "C",
      option_d: "D",
      correct_answer: "B",
    },
    {
      question: "",
      option_a: "A",
      option_b: "B",
      option_c: "C",
      option_d: "D",
      correct_answer: "Z",
    },
  ]);

  const questionForm = new FormData();
  questionForm.append(
    "file",
    new Blob([questionsBuffer]),
    "questions.xlsx",
  );
  questionForm.append("assessmentId", quiz.data.id);

  const questionPreview = await fetchWithSession(
    "/api/import/questions?mode=preview",
    trainer,
    { method: "POST", body: questionForm },
  );
  const questionPreviewJson = questionPreview.ok
    ? await questionPreview.json()
    : null;
  record(
    "AC-8,9,10",
    "Questions preview",
    questionPreview.status === 200 &&
      questionPreviewJson?.validCount === 1 &&
      questionPreviewJson?.invalidCount === 1,
    questionPreview.ok
      ? `valid=${questionPreviewJson?.validCount}, invalid=${questionPreviewJson?.invalidCount}`
      : "failed",
  );

  const questionCommitForm = new FormData();
  questionCommitForm.append(
    "file",
    new Blob([questionsBuffer]),
    "questions.xlsx",
  );
  questionCommitForm.append("assessmentId", quiz.data.id);

  const questionCommit = await fetchWithSession(
    "/api/import/questions?mode=commit",
    trainer,
    { method: "POST", body: questionCommitForm },
  );
  const questionCommitJson = questionCommit.ok
    ? await questionCommit.json()
    : null;
  record(
    "AC-11,12",
    "Questions commit",
    questionCommit.status === 201 && questionCommitJson?.successCount === 1,
    questionCommit.ok
      ? `success=${questionCommitJson?.successCount}`
      : "failed",
  );

  const enrollmentBuffer = buildWorkbook([
    {
      student_email: student.email,
      training_id: trainingId,
    },
    {
      student_email: "invalid-email",
      training_id: trainingId,
    },
  ]);

  const enrollmentForm = new FormData();
  enrollmentForm.append(
    "file",
    new Blob([enrollmentBuffer]),
    "enrollments.xlsx",
  );

  const enrollmentPreview = await fetchWithSession(
    "/api/import/enrollments?mode=preview",
    trainer,
    { method: "POST", body: enrollmentForm },
  );
  const enrollmentPreviewJson = enrollmentPreview.ok
    ? await enrollmentPreview.json()
    : null;
  record(
    "AC-4,5",
    "Enrollment preview",
    enrollmentPreview.status === 200 && enrollmentPreviewJson?.validCount >= 1,
    enrollmentPreview.ok
      ? `valid=${enrollmentPreviewJson?.validCount}`
      : "failed",
  );

  const enrollmentCommit = await fetchWithSession(
    "/api/import/enrollments?mode=commit",
    trainer,
    { method: "POST", body: enrollmentForm },
  );
  const enrollmentCommitJson = enrollmentCommit.ok
    ? await enrollmentCommit.json()
    : null;
  record(
    "AC-12b",
    "Enrollment commit",
    enrollmentCommit.status === 201 && enrollmentCommitJson?.successCount >= 1,
    enrollmentCommit.ok
      ? `success=${enrollmentCommitJson?.successCount}`
      : "failed",
  );

  const scoresBuffer = buildWorkbook([
    {
      student_email: student.email,
      training_id: trainingId,
      module_name: "QA Import Module",
      assessment_type: "quiz",
      score: 88,
    },
  ]);

  const scoresForm = new FormData();
  scoresForm.append("file", new Blob([scoresBuffer]), "scores.xlsx");

  const scoresPreview = await fetchWithSession(
    "/api/import/scores?mode=preview",
    trainer,
    { method: "POST", body: scoresForm },
  );
  const scoresPreviewJson = scoresPreview.ok ? await scoresPreview.json() : null;
  record(
    "AC-6,7",
    "Scores preview",
    scoresPreview.status === 200 && scoresPreviewJson?.validCount === 1,
    scoresPreview.ok ? `valid=${scoresPreviewJson?.validCount}` : "failed",
  );

  const importPage = await fetchWithSession("/trainer/import", trainer);
  record(
    "UI-1",
    "Import page",
    importPage.status === 200,
    `status=${importPage.status}`,
  );

  const failed = results.filter((result) => !result.passed).length;
  console.log(`\n=== Summary: ${results.length - failed}/${results.length} passed ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
