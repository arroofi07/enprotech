import "dotenv/config";

import { createQuestionUseCase } from "@/lib/application/assessments/create-question";
import { getOrCreateAssessment } from "@/lib/application/assessments/get-or-create-assessment";
import { getOrCreateTrainingAssessment } from "@/lib/application/assessments/get-or-create-training-assessment";
import { saveAttemptAnswers } from "@/lib/application/assessments/save-attempt-answers";
import { startAttempt } from "@/lib/application/assessments/start-attempt";
import { submitAttemptUseCase } from "@/lib/application/assessments/submit-attempt";
import { getStudentTrainingProgress } from "@/lib/application/progress/get-student-training-progress";
import { createModule } from "@/lib/application/modules/create-module";
import { updateStudentModuleProgress } from "@/lib/application/modules/update-student-module-progress";
import { activatePretest } from "@/lib/application/trainings/activate-pretest";
import { createTraining } from "@/lib/application/trainings/create-training";
import { enrollStudents } from "@/lib/application/trainings/enroll-students";
import { listEnrolledTrainings } from "@/lib/application/trainings/list-enrolled-trainings";
import { updateTraining } from "@/lib/application/trainings/update-training";
import type { QuestionRecord } from "@/lib/infrastructure/db/repositories/assessment-repository";
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
  init?: RequestInit,
) {
  const token = await createSessionToken(sessionUser);
  const headers = new Headers(init?.headers);
  headers.set("Cookie", `${SESSION_COOKIE_NAME}=${token}`);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    redirect: "manual",
  });
}

function defaultOptions(correctIndex = 0) {
  return ["A", "B", "C", "D"].map((text, index) => ({
    text: `Opsi ${text}`,
    isCorrect: index === correctIndex,
  }));
}

async function addQuestion(
  trainer: Awaited<ReturnType<typeof ensureUser>>,
  assessmentId: string,
): Promise<QuestionRecord | null> {
  const result = await createQuestionUseCase(trainer, {
    assessmentId,
    questionText: "Pertanyaan QA?",
    options: defaultOptions(0),
  });

  return result.success ? result.data : null;
}

function buildCorrectAnswers(questions: QuestionRecord[]) {
  return questions.map((question) => {
    const correctOption = question.options.find((option) => option.isCorrect);
    if (!correctOption) {
      throw new Error(`No correct option for question ${question.id}`);
    }

    return {
      questionId: question.id,
      selectedOptionId: correctOption.id,
    };
  });
}

async function passAssessment(
  student: Awaited<ReturnType<typeof ensureUser>>,
  assessmentId: string,
) {
  const started = await startAttempt(student, { assessmentId });
  if (!started.success) {
    return started;
  }

  const answers = buildCorrectAnswers(started.data.questions);
  const saved = await saveAttemptAnswers(student, started.data.attempt.id, {
    answers,
  });
  if (!saved.success) {
    return saved;
  }

  return submitAttemptUseCase(student, started.data.attempt.id);
}

async function getProgress(
  student: Awaited<ReturnType<typeof ensureUser>>,
  trainingId: string,
) {
  return getStudentTrainingProgress(student, { trainingId });
}

async function main() {
  console.log("=== T07 Manual QA Runner ===\n");

  const trainer = await ensureUser({
    email: "qa-t07-trainer@enprotech.test",
    name: "QA T07 Trainer",
    role: "trainer",
  });
  const student = await ensureUser({
    email: "qa-t07-student@enprotech.test",
    name: "QA T07 Student",
    role: "student",
  });

  const createResult = await createTraining(trainer, {
    title: `QA Progress Training ${Date.now()}`,
    description: "Manual QA progress tracking",
    passingGrade: 70,
    deadline: null,
  });

  if (!createResult.success) {
    record("setup", "Buat training", false, createResult.error);
    printSummary();
    process.exit(1);
  }

  const trainingId = createResult.data.id;
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 14);

  await updateTraining(trainer, {
    trainingId,
    status: "active",
    deadline,
  });

  const moduleResult = await createModule(trainer, {
    trainingId,
    title: "Modul QA Progress",
    materialUrl: "https://example.com/materi.pdf",
    materialSize: 1024,
  });

  if (!moduleResult.success) {
    record("setup", "Buat modul", false, moduleResult.error);
    printSummary();
    process.exit(1);
  }

  const moduleId = moduleResult.data.id;

  await enrollStudents(trainer, {
    trainingId,
    studentIds: [student.id],
  });

  const preTest = await getOrCreateTrainingAssessment(trainer, {
    trainingId,
    type: "pre_test",
  });
  const postTest = await getOrCreateTrainingAssessment(trainer, {
    trainingId,
    type: "post_test",
  });
  const quiz = await getOrCreateAssessment(trainer, {
    moduleId,
    type: "quiz",
  });
  const latihan = await getOrCreateAssessment(trainer, {
    moduleId,
    type: "latihan",
  });

  if (
    !preTest.success ||
    !postTest.success ||
    !quiz.success ||
    !latihan.success
  ) {
    record("setup", "Buat assessments", false, "assessment setup failed");
    printSummary();
    process.exit(1);
  }

  await addQuestion(trainer, preTest.data.id);
  await addQuestion(trainer, postTest.data.id);
  await addQuestion(trainer, quiz.data.id);
  await addQuestion(trainer, latihan.data.id);

  const activate = await activatePretest(trainer, { trainingId });
  record(
    "setup",
    "Aktifkan pre-test",
    activate.success,
    activate.success ? "pretest active" : activate.error,
  );

  const initial = await getProgress(student, trainingId);
  const initialOk =
    initial.success &&
    initial.data.summary.totalItems === 5 &&
    initial.data.summary.completedItems === 0 &&
    initial.data.summary.progressPercent === 0 &&
    initial.data.summary.modules.total === 1 &&
    initial.data.summary.quizzes.total === 1 &&
    initial.data.summary.latihans.total === 1;

  record(
    "AC-2,3,4,6",
    "Progress awal 0% dengan 1 modul/quiz/latihan",
    Boolean(initialOk),
    initial.success
      ? `total=${initial.data.summary.totalItems}, completed=${initial.data.summary.completedItems}, percent=${initial.data.summary.progressPercent}`
      : `error=${!initial.success ? initial.error : "unknown"}`,
  );

  record(
    "AC-5",
    "Pre-test locked/post-test locked di awal",
    Boolean(
      initial.success &&
        initial.data.summary.preTest.status === "not_started" &&
        initial.data.summary.postTest.status === "locked",
    ),
    initial.success
      ? `pre=${initial.data.summary.preTest.status}, post=${initial.data.summary.postTest.status}`
      : "progress unavailable",
  );

  record(
    "AC-10",
    "Deadline training tersedia",
    Boolean(initial.success && initial.data.deadline),
    initial.success ? `deadline=${initial.data.deadline}` : "no progress",
  );

  const preSubmit = await passAssessment(student, preTest.data.id);
  const afterPre = await getProgress(student, trainingId);
  const preProgressOk =
    afterPre.success &&
    afterPre.data.summary.preTest.status === "passed" &&
    afterPre.data.summary.completedItems === 1 &&
    afterPre.data.summary.progressPercent === 20;

  record(
    "AC-5,9",
    "Progress naik setelah submit pre-test",
    Boolean(preSubmit.success && preProgressOk),
    afterPre.success
      ? `completed=${afterPre.data.summary.completedItems}, percent=${afterPre.data.summary.progressPercent}, pre=${afterPre.data.summary.preTest.status}`
      : "progress unavailable",
  );

  await updateStudentModuleProgress(student, {
    moduleId,
    status: "in_progress",
  });
  await updateStudentModuleProgress(student, {
    moduleId,
    status: "completed",
  });

  const afterModule = await getProgress(student, trainingId);
  const moduleProgressOk =
    afterModule.success &&
    afterModule.data.modules[0]?.status === "completed" &&
    afterModule.data.summary.modules.completed === 1 &&
    afterModule.data.summary.completedItems === 2 &&
    afterModule.data.summary.progressPercent === 40;

  record(
    "AC-7,9",
    "Progress naik setelah modul completed",
    Boolean(moduleProgressOk),
    afterModule.success
      ? `module=${afterModule.data.modules[0]?.status}, completed=${afterModule.data.summary.completedItems}, percent=${afterModule.data.summary.progressPercent}`
      : "progress unavailable",
  );

  const quizSubmit = await passAssessment(student, quiz.data.id);
  const afterQuiz = await getProgress(student, trainingId);
  const quizProgressOk =
    afterQuiz.success &&
    afterQuiz.data.summary.quizzes.completed === 1 &&
    afterQuiz.data.summary.completedItems === 3 &&
    afterQuiz.data.summary.progressPercent === 60 &&
    afterQuiz.data.modules[0]?.quiz.hasPassed;

  record(
    "AC-3,8,9",
    "Progress & nilai quiz setelah lulus",
    Boolean(quizSubmit.success && quizProgressOk),
    afterQuiz.success
      ? `quiz=${afterQuiz.data.summary.quizzes.completed}/${afterQuiz.data.summary.quizzes.total}, best=${afterQuiz.data.modules[0]?.quiz.bestScore}`
      : "progress unavailable",
  );

  const latihanSubmit = await passAssessment(student, latihan.data.id);
  const afterLatihan = await getProgress(student, trainingId);
  const latihanProgressOk =
    afterLatihan.success &&
    afterLatihan.data.summary.latihans.completed === 1 &&
    afterLatihan.data.summary.completedItems === 4 &&
    afterLatihan.data.summary.progressPercent === 80;

  record(
    "AC-4,8,9",
    "Progress & nilai latihan setelah lulus",
    Boolean(latihanSubmit.success && latihanProgressOk),
    afterLatihan.success
      ? `latihan=${afterLatihan.data.summary.latihans.completed}/${afterLatihan.data.summary.latihans.total}, best=${afterLatihan.data.modules[0]?.latihan.bestScore}`
      : "progress unavailable",
  );

  const postSubmit = await passAssessment(student, postTest.data.id);
  const finalProgress = await getProgress(student, trainingId);
  const finalOk =
    finalProgress.success &&
    finalProgress.data.summary.completedItems === 5 &&
    finalProgress.data.summary.progressPercent === 100 &&
    finalProgress.data.summary.postTest.status === "passed";

  record(
    "AC-6,9",
    "Progress 100% setelah post-test lulus",
    Boolean(postSubmit.success && finalOk),
    finalProgress.success
      ? `completed=${finalProgress.data.summary.completedItems}, percent=${finalProgress.data.summary.progressPercent}`
      : "progress unavailable",
  );

  const enrolled = await listEnrolledTrainings(student);
  const enrolledItem = enrolled.success
    ? enrolled.data.find((item) => item.id === trainingId)
    : undefined;
  const enrolledOk =
    enrolled.success &&
    enrolledItem?.progressPercent === 100 &&
    enrolledItem.completedItems === 5;

  record(
    "AC-1",
    "Dashboard enrolled training menampilkan progress",
    Boolean(enrolledOk),
    enrolledItem
      ? `percent=${enrolledItem.progressPercent}, items=${enrolledItem.completedItems}/${enrolledItem.totalItems}`
      : "training not found in enrolled list",
  );

  const httpProgress = await fetchWithSession(
    `/api/student/trainings/${trainingId}/progress`,
    { ...student, status: "active" },
  );
  const httpProgressJson =
    httpProgress.status === 200
      ? ((await httpProgress.json()) as {
          summary?: { progressPercent?: number };
        })
      : null;

  record(
    "API",
    "GET /api/student/trainings/[id]/progress",
    httpProgress.status === 200 &&
      httpProgressJson?.summary?.progressPercent === 100,
    `status=${httpProgress.status}, percent=${httpProgressJson?.summary?.progressPercent ?? "n/a"}`,
  );

  const httpDashboard = await fetchWithSession("/student/dashboard", {
    ...student,
    status: "active",
  });
  const httpTrainingPage = await fetchWithSession(
    `/student/trainings/${trainingId}`,
    { ...student, status: "active" },
  );
  const httpModules = await fetchWithSession("/student/modules", {
    ...student,
    status: "active",
  });

  record(
    "AC-1",
    "HTTP student dashboard 200",
    httpDashboard.status === 200,
    `status=${httpDashboard.status}`,
  );
  record(
    "AC-1",
    "HTTP student training progress page 200",
    httpTrainingPage.status === 200,
    `status=${httpTrainingPage.status}`,
  );
  record(
    "AC-1",
    "HTTP student modules list 200",
    httpModules.status === 200,
    `status=${httpModules.status}`,
  );

  const hasPendingIndicator =
    afterPre.success &&
    (afterPre.data.modules[0]?.quiz.status === "not_started" ||
      afterPre.data.modules[0]?.latihan.status === "not_started");

  record(
    "AC-11",
    "Indikator assessment belum dikerjakan setelah pre-test",
    Boolean(hasPendingIndicator),
    afterPre.success
      ? `quiz=${afterPre.data.modules[0]?.quiz.status}, latihan=${afterPre.data.modules[0]?.latihan.status}`
      : "progress unavailable",
  );

  printSummary();
  process.exit(results.every((item) => item.passed) ? 0 : 1);
}

function printSummary() {
  const passed = results.filter((item) => item.passed).length;
  const failed = results.length - passed;
  console.log(
    `\n=== Summary: ${passed}/${results.length} passed, ${failed} failed ===`,
  );
  if (failed > 0) {
    console.log("\nFailed:");
    for (const item of results.filter((result) => !result.passed)) {
      console.log(`  ${item.id} ${item.label}: ${item.detail}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
