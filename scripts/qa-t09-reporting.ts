import "dotenv/config";

import { createQuestionUseCase } from "@/lib/application/assessments/create-question";
import { getOrCreateAssessment } from "@/lib/application/assessments/get-or-create-assessment";
import { saveAttemptAnswers } from "@/lib/application/assessments/save-attempt-answers";
import { startAttempt } from "@/lib/application/assessments/start-attempt";
import { submitAttemptUseCase } from "@/lib/application/assessments/submit-attempt";
import { createModule } from "@/lib/application/modules/create-module";
import { exportTrainingReport } from "@/lib/application/reports/export-training-report";
import { getStudentReportDetail } from "@/lib/application/reports/get-student-report-detail";
import { listTrainingReport } from "@/lib/application/reports/list-training-report";
import { createTraining } from "@/lib/application/trainings/create-training";
import { enrollStudents } from "@/lib/application/trainings/enroll-students";
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

const QA_PASSWORD = "QaTest123!";
const BASE_URL = process.env.QA_BASE_URL ?? "http://localhost:3000";

type QaResult = {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
};

const results: QaResult[] = [];

function record(id: string, label: string, passed: boolean, detail: string) {
  results.push({ id, label, passed, detail });
  const icon = passed ? "PASS" : "FAIL";
  console.log(`[${icon}] ${id} ${label} — ${detail}`);
}

async function ensureUser(input: {
  email: string;
  name: string;
  role: "admin" | "trainer" | "student";
}) {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    return {
      id: existing.id,
      email: existing.email,
      name: existing.name,
      role: existing.role,
      status: existing.status,
    };
  }

  const passwordHash = await hashPassword(QA_PASSWORD);
  const user = await createUser({
    email: input.email,
    name: input.name,
    passwordHash,
    role: input.role,
    status: "active",
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
  };
}

async function fetchWithSession(
  path: string,
  sessionUser: {
    id: string;
    email: string;
    name: string;
    role: "admin" | "trainer" | "student";
    status: "active";
  },
) {
  const token = await createSessionToken(sessionUser);
  return fetch(`${BASE_URL}${path}`, {
    headers: {
      Cookie: `${SESSION_COOKIE_NAME}=${token}`,
    },
    redirect: "manual",
  });
}

function defaultOptions(correctIndex = 0) {
  return ["A", "B", "C", "D"].map((text, index) => ({
    text: `Opsi ${text}`,
    isCorrect: index === correctIndex,
  }));
}

async function ensureQuestion(
  trainer: Awaited<ReturnType<typeof ensureUser>>,
  assessmentId: string,
) {
  const result = await createQuestionUseCase(trainer, {
    assessmentId,
    questionText: "Pertanyaan QA?",
    options: defaultOptions(0),
  });

  if (!result.success) {
    throw new Error(result.message);
  }
}

async function passAssessment(
  student: Awaited<ReturnType<typeof ensureUser>>,
  assessmentId: string,
) {
  const started = await startAttempt(student, { assessmentId });
  if (!started.success) {
    throw new Error(started.message);
  }

  const answers = started.data.questions.map((question) => {
    const correctOption = question.options.find((option) => option.isCorrect);
    if (!correctOption) {
      throw new Error(`No correct option for question ${question.id}`);
    }

    return {
      questionId: question.id,
      selectedOptionId: correctOption.id,
    };
  });

  const saved = await saveAttemptAnswers(student, started.data.attempt.id, {
    answers,
  });
  if (!saved.success) {
    throw new Error(saved.message);
  }

  const submitted = await submitAttemptUseCase(student, started.data.attempt.id);
  if (!submitted.success) {
    throw new Error(submitted.message);
  }
}

async function main() {
  console.log("=== T09 Manual QA Runner ===\n");

  const trainer = await ensureUser({
    email: "qa-t09-trainer@enprotech.test",
    name: "QA T09 Trainer",
    role: "trainer",
  });
  const student = await ensureUser({
    email: "qa-t09-student@enprotech.test",
    name: "QA T09 Student",
    role: "student",
  });

  const createResult = await createTraining(trainer, {
    title: `QA Report Training ${Date.now()}`,
    description: "Manual QA reporting",
    passingGrade: 70,
    deadline: null,
  });
  if (!createResult.success) {
    throw new Error(createResult.message);
  }

  const trainingId = createResult.data.id;
  await updateTraining(trainer, {
    trainingId,
    status: "active",
  });

  const moduleResult = await createModule(trainer, {
    trainingId,
    title: "QA Report Module",
    materialUrl: "https://example.com/materi.pdf",
    materialSize: 1024,
    minQuizScore: 70,
    minLatihanScore: 70,
  });
  if (!moduleResult.success) {
    throw new Error(moduleResult.message);
  }

  const enrollResult = await enrollStudents(trainer, {
    trainingId,
    studentIds: [student.id],
  });
  if (!enrollResult.success) {
    throw new Error(enrollResult.message);
  }

  const quiz = await getOrCreateAssessment(trainer, {
    moduleId: moduleResult.data.id,
    type: "quiz",
  });
  const latihan = await getOrCreateAssessment(trainer, {
    moduleId: moduleResult.data.id,
    type: "latihan",
  });
  if (!quiz.success || !latihan.success) {
    throw new Error("Failed to create assessments");
  }

  await ensureQuestion(trainer, quiz.data.id);
  await ensureQuestion(trainer, latihan.data.id);
  await passAssessment(student, quiz.data.id);
  await passAssessment(student, latihan.data.id);

  const listResult = await listTrainingReport(trainer, {
    trainingId,
    studentId: student.id,
    page: 1,
    pageSize: 10,
  });
  record(
    "AC-2",
    "List report rows",
    listResult.success && listResult.data.items.length > 0,
    listResult.success
      ? `${listResult.data.items.length} row(s), quiz=${listResult.data.items[0]?.quizScore}`
      : "failed",
  );

  const detailResult = await getStudentReportDetail(trainer, {
    studentId: student.id,
    trainingId,
  });
  const attemptCount = detailResult.success
    ? detailResult.data.assessments.reduce(
        (sum, assessment) => sum + assessment.attempts.length,
        0,
      )
    : 0;
  record(
    "AC-8",
    "Student detail attempts",
    detailResult.success && attemptCount >= 2,
    detailResult.success ? `${attemptCount} submitted attempt(s)` : "failed",
  );

  const excelExport = await exportTrainingReport(trainer, {
    trainingId,
    format: "xlsx",
  });
  record(
    "AC-9",
    "Export Excel",
    excelExport.success && excelExport.data.buffer.byteLength > 0,
    excelExport.success
      ? `${excelExport.data.filename} (${excelExport.data.buffer.byteLength} bytes)`
      : "failed",
  );

  const pdfExport = await exportTrainingReport(trainer, {
    trainingId,
    format: "pdf",
  });
  record(
    "AC-10",
    "Export PDF",
    pdfExport.success && pdfExport.data.buffer.byteLength > 0,
    pdfExport.success
      ? `${pdfExport.data.filename} (${pdfExport.data.buffer.byteLength} bytes)`
      : "failed",
  );

  try {
    const apiResponse = await fetchWithSession(
      `/api/reports/training?trainingId=${trainingId}&studentId=${student.id}`,
      { ...trainer, status: "active" as const },
    );
    record(
      "API-1",
      "GET /api/reports/training",
      apiResponse.status === 200,
      `status=${apiResponse.status}`,
    );
  } catch (error) {
    record(
      "API-1",
      "GET /api/reports/training",
      false,
      error instanceof Error ? error.message : "fetch failed",
    );
  }

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
