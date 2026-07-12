import "dotenv/config";

import { loginUser } from "@/lib/application/auth/login-user";
import { enrollStudents } from "@/lib/application/trainings/enroll-students";
import { listEnrolledTrainings } from "@/lib/application/trainings/list-enrolled-trainings";
import { listTrainings } from "@/lib/application/trainings/list-trainings";
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

type Role = "admin" | "trainer" | "student";
type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: "active";
};

type QaResult = {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
};

const results: QaResult[] = [];

function record(id: string, label: string, passed: boolean, detail: string) {
  results.push({ id, label, passed, detail });
  console.log(`[${passed ? "PASS" : "FAIL"}] ${id} ${label} — ${detail}`);
}

async function ensureUser(input: {
  email: string;
  name: string;
  role: Role;
}): Promise<SessionUser> {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    return {
      id: existing.id,
      email: existing.email,
      name: existing.name,
      role: existing.role as Role,
      status: "active",
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
    role: user.role as Role,
    status: "active",
  };
}

async function fetchPath(
  path: string,
  sessionUser?: SessionUser,
  init?: RequestInit,
) {
  const headers = new Headers(init?.headers);
  if (sessionUser) {
    const token = await createSessionToken(sessionUser);
    headers.set("Cookie", `${SESSION_COOKIE_NAME}=${token}`);
  }

  return fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    redirect: "manual",
  });
}

async function expectPage(
  id: string,
  label: string,
  path: string,
  sessionUser: SessionUser | undefined,
  expectedStatus: number,
) {
  const response = await fetchPath(path, sessionUser);
  const passed = response.status === expectedStatus;
  record(
    id,
    label,
    passed,
    `GET ${path} → ${response.status} (expected ${expectedStatus})`,
  );
  return response;
}

async function expectRedirect(
  id: string,
  label: string,
  path: string,
  sessionUser: SessionUser | undefined,
  expectedLocationPrefix: string,
) {
  const response = await fetchPath(path, sessionUser);
  const location = response.headers.get("location") ?? "";
  const passed =
    (response.status === 307 || response.status === 302) &&
    location.includes(expectedLocationPrefix);
  record(
    id,
    label,
    passed,
    `GET ${path} → ${response.status} location=${location}`,
  );
}

async function main() {
  console.log("=== Full Site Manual QA Runner ===\n");

  const admin = await ensureUser({
    email: "qa-full-admin@enprotech.test",
    name: "QA Full Admin",
    role: "admin",
  });
  const trainer = await ensureUser({
    email: "qa-full-trainer@enprotech.test",
    name: "QA Full Trainer",
    role: "trainer",
  });
  const student = await ensureUser({
    email: "qa-full-student@enprotech.test",
    name: "QA Full Student",
    role: "student",
  });

  // Public pages
  await expectRedirect(
    "PUB-1",
    "Landing page redirects unauthenticated to login",
    "/",
    undefined,
    "/login",
  );
  await expectPage("PUB-2", "Login page public", "/login", undefined, 200);
  await expectPage("PUB-3", "Register page public", "/register", undefined, 200);
  await expectPage("PUB-4", "Verify page public", "/verify", undefined, 200);
  await expectPage(
    "PUB-5",
    "Verify invalid cert public",
    "/verify/INVALID-CERT-0000",
    undefined,
    200,
  );
  await expectRedirect(
    "PUB-6",
    "Unauthenticated dashboard redirect to login",
    "/student/dashboard",
    undefined,
    "/login",
  );

  // Auth API
  const loginOk = await fetchPath("/api/users", admin);
  record(
    "API-AUTH-1",
    "Authenticated API access",
    loginOk.status === 200 || loginOk.status === 403,
    `GET /api/users as admin → ${loginOk.status}`,
  );

  const loginBad = await loginUser({
    email: student.email,
    password: "wrong-password",
  });
  record(
    "AUTH-1",
    "Login invalid password rejected",
    !loginBad.success && loginBad.error === "INVALID_CREDENTIALS",
    loginBad.success
      ? "unexpected success"
      : `error=${loginBad.error}`,
  );

  // Role access control
  await expectRedirect(
    "RBAC-1",
    "Student blocked from trainer routes",
    "/trainer/modules",
    student,
    "/unauthorized",
  );
  await expectRedirect(
    "RBAC-2",
    "Student blocked from admin routes",
    "/admin/users",
    student,
    "/unauthorized",
  );
  await expectRedirect(
    "RBAC-3",
    "Trainer blocked from admin routes",
    "/admin/users",
    trainer,
    "/unauthorized",
  );
  await expectPage(
    "RBAC-4",
    "Admin can access trainer routes",
    "/trainer/modules",
    admin,
    200,
  );
  await expectPage(
    "RBAC-5",
    "Admin can access admin routes",
    "/admin/users",
    admin,
    200,
  );

  const trainerTrainings = await listTrainings(trainer, {});
  const trainingId =
    trainerTrainings.success && trainerTrainings.data.items.length > 0
      ? trainerTrainings.data.items[0].id
      : null;

  if (trainingId) {
    await enrollStudents(trainer, {
      trainingId,
      studentIds: [student.id],
    });
  }

  const enrolled = await listEnrolledTrainings(student, { page: 1, pageSize: 100 });
  const studentTrainingId =
    enrolled.success && enrolled.data.items.length > 0
      ? enrolled.data.items[0].id
      : null;

  const redirectPages: Array<{
    id: string;
    label: string;
    path: string;
    user: SessionUser;
    location: string;
  }> = [
    {
      id: "TRAINER-REDIRECT-reports",
      label: "Trainer /reports redirects to nilai",
      path: "/trainer/reports",
      user: trainer,
      location: "/trainer/nilai",
    },
    {
      id: "STUDENT-REDIRECT-progress",
      label: "Student /progress redirects to nilai",
      path: "/student/progress",
      user: student,
      location: "/student/nilai",
    },
    {
      id: "TRAINER-REDIRECT-trainings",
      label: "Trainer /trainings redirects to modules",
      path: "/trainer/trainings",
      user: trainer,
      location: "/trainer/modules",
    },
  ];

  for (const item of redirectPages) {
    await expectRedirect(item.id, item.label, item.path, item.user, item.location);
  }

  const staticTrainerPages = [
    "/trainer/dashboard",
    "/trainer/trainings/new",
    "/trainer/import",
    "/trainer/pre-test",
    "/trainer/modules",
    "/trainer/video-conference",
    "/trainer/quiz",
    "/trainer/latihan",
    "/trainer/post-test",
    "/trainer/nilai",
    "/trainer/certificates",
  ];

  for (const path of staticTrainerPages) {
    const id = `TRAINER-PAGE-${path}`;
    await expectPage(id, `Trainer page ${path}`, path, trainer, 200);
  }

  const staticStudentPages = [
    "/student/dashboard",
    "/student/trainings",
    "/student/modules",
    "/student/pre-test",
    "/student/video-conference",
    "/student/quiz",
    "/student/latihan",
    "/student/post-test",
    "/student/nilai",
    "/student/certificates",
  ];

  for (const path of staticStudentPages) {
    const id = `STUDENT-PAGE-${path}`;
    await expectPage(id, `Student page ${path}`, path, student, 200);
  }

  const staticAdminPages = ["/admin/dashboard", "/admin/users"];
  for (const path of staticAdminPages) {
    const id = `ADMIN-PAGE-${path}`;
    await expectPage(id, `Admin page ${path}`, path, admin, 200);
  }

  if (trainingId) {
    const dynamicTrainerPages = [
      `/trainer/trainings/${trainingId}/edit`,
      `/trainer/trainings/${trainingId}/modules`,
      `/trainer/trainings/${trainingId}/pre-test`,
      `/trainer/trainings/${trainingId}/post-test`,
    ];
    for (const path of dynamicTrainerPages) {
      await expectPage(`DYN-TRAINER-${path}`, `Trainer dynamic ${path}`, path, trainer, 200);
    }
  } else {
    record("DYN-TRAINER", "Trainer dynamic pages skipped", false, "no training found");
  }

  if (studentTrainingId) {
    const dynamicStudentPages = [
      `/student/trainings/${studentTrainingId}`,
      `/student/trainings/${studentTrainingId}/pre-test`,
      `/student/trainings/${studentTrainingId}/post-test`,
    ];
    for (const path of dynamicStudentPages) {
      await expectPage(`DYN-STUDENT-${path}`, `Student dynamic ${path}`, path, student, 200);
    }

    const progressApi = await fetchPath(
      `/api/student/trainings/${studentTrainingId}/progress`,
      student,
    );
    record(
      "API-PROGRESS",
      "Student progress API",
      progressApi.status === 200,
      `GET progress → ${progressApi.status}`,
    );
  } else {
    record("DYN-STUDENT", "Student dynamic pages skipped", false, "no enrolled training");
  }

  const notificationsApi = await fetchPath("/api/notifications", trainer);
  record(
    "API-NOTIF",
    "Notifications API",
    notificationsApi.status === 200,
    `GET /api/notifications → ${notificationsApi.status}`,
  );

  const reportsApi = await fetchPath("/api/reports/training", trainer);
  record(
    "API-REPORTS",
    "Reports API",
    reportsApi.status === 200,
    `GET /api/reports/training → ${reportsApi.status}`,
  );

  const certsApi = await fetchPath("/api/certificates", student);
  record(
    "API-CERTS",
    "Certificates API",
    certsApi.status === 200,
    `GET /api/certificates → ${certsApi.status}`,
  );

  const healthApi = await fetchPath("/api/health/db");
  record(
    "API-HEALTH",
    "Health check API",
    healthApi.status === 200,
    `GET /api/health/db → ${healthApi.status}`,
  );

  const passed = results.filter((item) => item.passed).length;
  const failed = results.length - passed;
  console.log(`\n=== Summary: ${passed}/${results.length} passed, ${failed} failed ===`);

  if (failed > 0) {
    console.log("\nFailed:");
    for (const item of results.filter((result) => !result.passed)) {
      console.log(`  ${item.id} ${item.label}: ${item.detail}`);
    }
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
