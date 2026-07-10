import "dotenv/config";

import { loginUser } from "@/lib/application/auth/login-user";
import { listUsers } from "@/lib/application/users/list-users";
import { activatePretest } from "@/lib/application/trainings/activate-pretest";
import { archiveTraining } from "@/lib/application/trainings/archive-training";
import { createTraining } from "@/lib/application/trainings/create-training";
import { enrollStudents } from "@/lib/application/trainings/enroll-students";
import { getTraining } from "@/lib/application/trainings/get-training";
import { listEnrolledTrainings } from "@/lib/application/trainings/list-enrolled-trainings";
import { listTrainings } from "@/lib/application/trainings/list-trainings";
import { removeEnrollment } from "@/lib/application/trainings/remove-enrollment";
import { updateTraining } from "@/lib/application/trainings/update-training";
import { TrainingErrorCode } from "@/lib/domain/trainings/errors";
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
  id: number;
  label: string;
  passed: boolean;
  detail: string;
};

const results: QaResult[] = [];

function record(id: number, label: string, passed: boolean, detail: string) {
  results.push({ id, label, passed, detail });
  const icon = passed ? "PASS" : "FAIL";
  console.log(`[${icon}] #${id} ${label} — ${detail}`);
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

async function main() {
  console.log("=== T03 Manual QA Runner ===\n");

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@enprotech.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "adminsaya123!";

  const trainer = await ensureUser({
    email: "qa-trainer@enprotech.test",
    name: "QA Trainer",
    role: "trainer",
  });
  const student1 = await ensureUser({
    email: "qa-student1@enprotech.test",
    name: "QA Student One",
    role: "student",
  });
  const student2 = await ensureUser({
    email: "qa-student2@enprotech.test",
    name: "QA Student Two",
    role: "student",
  });
  const student3 = await ensureUser({
    email: "qa-student3@enprotech.test",
    name: "QA Student Three",
    role: "student",
  });

  // 1. Create draft training
  const createResult = await createTraining(trainer, {
    title: `QA Training ${Date.now()}`,
    description: "Manual QA training",
    passingGrade: 75,
    deadline: null,
  });
  record(
    1,
    "Buat training draft",
    createResult.success && createResult.data.status === "draft",
    createResult.success
      ? `id=${createResult.data.id}, status=${createResult.data.status}`
      : `error=${!createResult.success ? createResult.error : "unknown"}`,
  );

  if (!createResult.success) {
    printSummary();
    process.exit(1);
  }

  const trainingId = createResult.data.id;

  // 2. Edit title, passing grade, deadline
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 30);
  const updateResult = await updateTraining(trainer, {
    trainingId,
    title: "QA Training Updated",
    passingGrade: 85,
    deadline: tomorrow,
  });
  record(
    2,
    "Edit judul, passing grade, deadline",
    updateResult.success &&
      updateResult.data.title === "QA Training Updated" &&
      updateResult.data.passingGrade === 85,
    updateResult.success
      ? `title=${updateResult.data.title}, grade=${updateResult.data.passingGrade}`
      : `error=${!updateResult.success ? updateResult.error : "unknown"}`,
  );

  // 3. Publish
  const publishResult = await updateTraining(trainer, {
    trainingId,
    status: "active",
  });
  record(
    3,
    "Publikasikan training",
    publishResult.success && publishResult.data.status === "active",
    publishResult.success
      ? `status=${publishResult.data.status}`
      : `error=${!publishResult.success ? publishResult.error : "unknown"}`,
  );

  // 4a. Enroll 1 student
  const enrollOne = await enrollStudents(trainer, {
    trainingId,
    studentIds: [student1.id],
  });
  record(
    4,
    "Enroll 1 student",
    enrollOne.success && enrollOne.data.length === 1,
    enrollOne.success
      ? `enrolled=${enrollOne.data.length}`
      : `error=${!enrollOne.success ? enrollOne.error : "unknown"}`,
  );

  // 4b. Enroll multiple students
  const enrollMany = await enrollStudents(trainer, {
    trainingId,
    studentIds: [student2.id, student3.id],
  });
  record(
    4,
    "Enroll multiple students",
    enrollMany.success && enrollMany.data.length === 2,
    enrollMany.success
      ? `enrolled=${enrollMany.data.length}`
      : `error=${!enrollMany.success ? enrollMany.error : "unknown"}`,
  );

  // 5. Re-enroll same student
  const reEnroll = await enrollStudents(trainer, {
    trainingId,
    studentIds: [student1.id],
  });
  record(
    5,
    "Enroll ulang student sama ditolak",
    !reEnroll.success &&
      reEnroll.error === TrainingErrorCode.ALREADY_ENROLLED,
    !reEnroll.success ? `error=${reEnroll.error}` : "unexpected success",
  );

  // 6. Remove one enrollment
  const detailBeforeRemove = await getTraining(trainer, { trainingId });
  const enrollmentToRemove =
    detailBeforeRemove.success &&
    detailBeforeRemove.data.enrollments.find(
      (item) => item.studentId === student3.id,
    );

  const removeResult = enrollmentToRemove
    ? await removeEnrollment(trainer, {
        enrollmentId: enrollmentToRemove.id,
      })
    : null;

  record(
    6,
    "Remove student dari enrollment",
    Boolean(removeResult?.success),
    removeResult?.success
      ? `removed=${removeResult.data.enrollmentId}`
      : "enrollment not found or remove failed",
  );

  // 8 & 9. Student view before archive
  const studentView = await listEnrolledTrainings(student1, { page: 1, pageSize: 100 });
  const hasTraining =
    studentView.success &&
    studentView.data.items.some((item) => item.id === trainingId);
  const progressOk =
    studentView.success &&
    studentView.data.items.find((item) => item.id === trainingId)?.progressPercent ===
      0;

  record(
    8,
    "Student lihat training enrolled (non-draft)",
    hasTraining,
    studentView.success
      ? `count=${studentView.data.length}, found=${hasTraining}`
      : `error=${!studentView.success ? studentView.error : "unknown"}`,
  );

  record(
    9,
    "Progress bar 0% tanpa modul",
    progressOk,
    progressOk ? "progressPercent=0" : "progress missing or not 0",
  );

  // 10. Pre-test without modules
  const pretestFail = await activatePretest(trainer, { trainingId });
  record(
    10,
    "Aktifkan pre-test tanpa modul ditolak",
    !pretestFail.success &&
      pretestFail.error === TrainingErrorCode.MODULES_NOT_READY,
    !pretestFail.success ? `error=${pretestFail.error}` : "unexpected success",
  );

  // 11. Student forbidden on trainer list (application layer)
  const studentListTrainings = await listTrainings(student1, {});
  record(
    11,
    "Student tidak bisa list trainings trainer",
    !studentListTrainings.success &&
      studentListTrainings.error === TrainingErrorCode.FORBIDDEN,
    !studentListTrainings.success
      ? `error=${studentListTrainings.error}`
      : "unexpected success",
  );

  // HTTP: student /trainer/trainings -> unauthorized redirect
  const httpStudentTrainer = await fetchWithSession(
    "/trainer/trainings",
    { ...student1, status: "active" },
  );
  const httpUnauthorized = Boolean(
    httpStudentTrainer.status === 307 ||
      httpStudentTrainer.status === 308 ||
      httpStudentTrainer.headers.get("location")?.includes("/unauthorized"),
  );
  record(
    11,
    "Student HTTP /trainer/trainings unauthorized",
    httpUnauthorized,
    `status=${httpStudentTrainer.status}, location=${httpStudentTrainer.headers.get("location") ?? "none"}`,
  );

  // 7. Archive training
  const archiveResult = await archiveTraining(trainer, { trainingId });
  record(
    7,
    "Archive training",
    archiveResult.success && archiveResult.data.status === "archived",
    archiveResult.success
      ? `status=${archiveResult.data.status}`
      : `error=${!archiveResult.success ? archiveResult.error : "unknown"}`,
  );

  const studentAfterArchive = await listEnrolledTrainings(student1, {
    page: 1,
    pageSize: 100,
  });
  const hiddenAfterArchive =
    studentAfterArchive.success &&
    !studentAfterArchive.data.items.some((item) => item.id === trainingId);
  record(
    7,
    "Training archived hilang dari student view",
    hiddenAfterArchive,
    studentAfterArchive.success
      ? `visible=${!hiddenAfterArchive}`
      : `error=${!studentAfterArchive.success ? studentAfterArchive.error : "unknown"}`,
  );

  // 12. Regression T01 login
  const adminLogin = await loginUser({
    email: adminEmail,
    password: adminPassword,
  });
  const trainerLogin = await loginUser({
    email: trainer.email,
    password: QA_PASSWORD,
  });
  record(
    12,
    "Regresi T01 login admin & trainer",
    adminLogin.success && trainerLogin.success,
    `admin=${adminLogin.success}, trainer=${trainerLogin.success}`,
  );

  // 12. Regression T02 list users
  if (adminLogin.success) {
    const usersList = await listUsers(adminLogin.data.user, {
      page: 1,
      pageSize: 5,
    });
    record(
      12,
      "Regresi T02 admin list users",
      usersList.success && usersList.data.items.length > 0,
      usersList.success
        ? `total=${usersList.data.total}`
        : `error=${!usersList.success ? usersList.error : "unknown"}`,
    );
  } else {
    record(12, "Regresi T02 admin list users", false, "admin login failed");
  }

  // HTTP smoke: trainer trainings page
  const httpTrainerList = await fetchWithSession("/trainer/trainings", {
    ...trainer,
    status: "active",
  });
  record(
    13,
    "Trainer GET /trainer/trainings",
    httpTrainerList.status === 200,
    `status=${httpTrainerList.status}`,
  );

  printSummary();
  process.exit(results.every((item) => item.passed) ? 0 : 1);
}

function printSummary() {
  const passed = results.filter((item) => item.passed).length;
  const failed = results.length - passed;
  console.log(`\n=== Summary: ${passed}/${results.length} passed, ${failed} failed ===`);
  if (failed > 0) {
    console.log("\nFailed:");
    for (const item of results.filter((result) => !result.passed)) {
      console.log(`  #${item.id} ${item.label}: ${item.detail}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
