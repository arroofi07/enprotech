import "dotenv/config";

import { listNotifications } from "@/lib/application/notifications/list-notifications";
import { updateNotifications } from "@/lib/application/notifications/update-notifications";
import { createModule } from "@/lib/application/modules/create-module";
import { updateStudentModuleProgress } from "@/lib/application/modules/update-student-module-progress";
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
  console.log("=== T08 Manual QA Runner ===\n");

  const admin = await ensureUser({
    email: "qa-t08-admin@enprotech.test",
    name: "QA T08 Admin",
    role: "admin",
  });
  const trainer = await ensureUser({
    email: "qa-t08-trainer@enprotech.test",
    name: "QA T08 Trainer",
    role: "trainer",
  });
  const student = await ensureUser({
    email: "qa-t08-student@enprotech.test",
    name: "QA T08 Student",
    role: "student",
  });

  const createResult = await createTraining(trainer, {
    title: `QA Notification Training ${Date.now()}`,
    description: "Manual QA notifications",
    passingGrade: 70,
    deadline: null,
  });

  if (!createResult.success) {
    record("setup", "Buat training", false, createResult.error);
    printSummary();
    process.exit(1);
  }

  const trainingId = createResult.data.id;

  const moduleResult = await createModule(trainer, {
    trainingId,
    title: "Modul Notifikasi QA",
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

  await updateTraining(trainer, {
    trainingId,
    status: "active",
  });

  const completeModule = await updateStudentModuleProgress(student, {
    moduleId,
    status: "completed",
  });

  record(
    "setup",
    "Student selesaikan modul",
    completeModule.success,
    completeModule.success ? "module completed" : completeModule.error,
  );

  const trainerNotifications = await listNotifications(trainer);
  const moduleNotification = trainerNotifications.success
    ? trainerNotifications.data.items.find(
        (item) =>
          item.type === "module_completed" &&
          item.message.includes("QA T08 Student") &&
          item.message.includes("Modul Notifikasi QA") &&
          item.href?.includes(`/trainer/trainings/${trainingId}`),
      )
    : undefined;

  record(
    "AC-4,5",
    "Trainer menerima notifikasi modul selesai",
    Boolean(moduleNotification),
    moduleNotification
      ? `title=${moduleNotification.title}`
      : "notification not found",
  );

  const adminNotifications = await listNotifications(admin);
  const adminHasNotification = adminNotifications.success
    ? adminNotifications.data.items.some(
        (item) =>
          item.type === "module_completed" &&
          item.message.includes("Modul Notifikasi QA"),
      )
    : false;

  record(
    "AC-4",
    "Admin menerima notifikasi modul selesai",
    adminHasNotification,
    adminNotifications.success
      ? `unread=${adminNotifications.data.unreadCount}`
      : "list failed",
  );

  record(
    "AC-2",
    "Badge counter unread > 0 untuk trainer",
    Boolean(
      trainerNotifications.success && trainerNotifications.data.unreadCount > 0,
    ),
    trainerNotifications.success
      ? `unread=${trainerNotifications.data.unreadCount}`
      : "list failed",
  );

  if (moduleNotification) {
    const markOne = await updateNotifications(trainer, {
      notificationId: moduleNotification.id,
    });
    const afterMark = await listNotifications(trainer);
    const markedItem = afterMark.success
      ? afterMark.data.items.find((item) => item.id === moduleNotification.id)
      : undefined;

    record(
      "AC-7",
      "Mark single notification as read",
      Boolean(markOne.success && markedItem?.isRead),
      markOne.success ? `isRead=${markedItem?.isRead}` : "mark failed",
    );
  } else {
    record("AC-7", "Mark single notification as read", false, "no notification");
  }

  const markAll = await updateNotifications(trainer, { markAll: true });
  const afterMarkAll = await listNotifications(trainer);

  record(
    "AC-8",
    "Mark all notifications as read",
    markAll.success &&
      afterMarkAll.success &&
      afterMarkAll.data.unreadCount === 0,
    afterMarkAll.success
      ? `unread=${afterMarkAll.data.unreadCount}`
      : "list failed",
  );

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 3);
  await updateTraining(trainer, {
    trainingId,
    deadline,
  });

  const studentNotifications = await listNotifications(student);
  const deadlineNotification = studentNotifications.success
    ? studentNotifications.data.items.find(
        (item) =>
          item.type === "deadline_reminder" &&
          item.title.includes("H-3") &&
          item.message.includes("QA Notification Training") &&
          item.href?.includes(`/student/trainings/${trainingId}`),
      )
    : undefined;

  record(
    "AC-6",
    "Student menerima reminder deadline H-3",
    Boolean(deadlineNotification),
    deadlineNotification
      ? `href=${deadlineNotification.href}`
      : "reminder not found",
  );

  record(
    "AC-10",
    "Notifikasi memiliki href redirect",
    Boolean(
      moduleNotification?.href?.includes(`/trainer/trainings/${trainingId}`) &&
        deadlineNotification?.href?.includes(`/student/trainings/${trainingId}`),
    ),
    `moduleHref=${moduleNotification?.href ?? "n/a"}, deadlineHref=${deadlineNotification?.href ?? "n/a"}`,
  );

  const httpNotifications = await fetchWithSession(
    "/api/notifications",
    { ...trainer, status: "active" },
  );
  const httpJson =
    httpNotifications.status === 200
      ? ((await httpNotifications.json()) as { unreadCount?: number })
      : null;

  record(
    "API",
    "GET /api/notifications",
    httpNotifications.status === 200 && typeof httpJson?.unreadCount === "number",
    `status=${httpNotifications.status}, unread=${httpJson?.unreadCount ?? "n/a"}`,
  );

  const httpDashboard = await fetchWithSession("/student/dashboard", {
    ...student,
    status: "active",
  });

  record(
    "AC-1,3",
    "Halaman dashboard student memuat (bell di header)",
    httpDashboard.status === 200,
    `status=${httpDashboard.status}`,
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
