import { getDashboardPath } from "@/lib/domain/auth/permissions";
import { ROLE_LABELS } from "@/lib/domain/auth/role-labels";
import type { UserRole } from "@/lib/domain/auth/types";
import { formatTrainingDeadline } from "@/lib/domain/trainings/format-deadline";

import {
  NotificationType,
  type DeadlineReminderDay,
  type NotificationData,
} from "./types";

export type ModuleCompletedNotificationInput = {
  studentId: string;
  studentName: string;
  moduleId: string;
  moduleName: string;
  trainingId: string;
  trainingName: string;
};

export type DeadlineReminderNotificationInput = {
  trainingId: string;
  trainingName: string;
  deadline: string;
  reminderDay: DeadlineReminderDay;
};

export function buildModuleCompletedDedupKey(input: {
  studentId: string;
  moduleId: string;
}): string {
  return `module_completed:${input.studentId}:${input.moduleId}`;
}

export function buildDeadlineReminderDedupKey(input: {
  trainingId: string;
  reminderDay: DeadlineReminderDay;
}): string {
  return `deadline_reminder:${input.trainingId}:h${input.reminderDay}`;
}

export function buildModuleCompletedNotification(
  input: ModuleCompletedNotificationInput,
) {
  const href = `/trainer/trainings/${input.trainingId}/modules`;
  const data: NotificationData = {
    href,
    trainingId: input.trainingId,
    moduleId: input.moduleId,
    studentId: input.studentId,
    studentName: input.studentName,
    moduleName: input.moduleName,
    trainingName: input.trainingName,
    dedupKey: buildModuleCompletedDedupKey(input),
  };

  return {
    type: NotificationType.MODULE_COMPLETED,
    title: "Modul diselesaikan",
    message: `${input.studentName} menyelesaikan modul "${input.moduleName}" pada training "${input.trainingName}".`,
    data,
  };
}

export function buildDeadlineReminderNotification(
  input: DeadlineReminderNotificationInput,
) {
  const deadlineLabel = formatTrainingDeadline(input.deadline, "long");
  const href = `/student/trainings/${input.trainingId}`;
  const data: NotificationData = {
    href,
    trainingId: input.trainingId,
    trainingName: input.trainingName,
    reminderDay: input.reminderDay,
    dedupKey: buildDeadlineReminderDedupKey(input),
  };

  return {
    type: NotificationType.DEADLINE_REMINDER,
    title:
      input.reminderDay === 3
        ? "Reminder deadline H-3"
        : "Reminder deadline H-1",
    message: `Training "${input.trainingName}" berakhir ${input.reminderDay === 3 ? "3 hari" : "besok"} (${deadlineLabel ?? input.deadline}). Segera selesaikan progress Anda.`,
    data,
  };
}

// --- Tier 1 --------------------------------------------------------------

export function buildEnrolledNotification(input: {
  trainingId: string;
  trainingName: string;
}) {
  const data: NotificationData = {
    href: `/student/trainings/${input.trainingId}`,
    trainingId: input.trainingId,
    trainingName: input.trainingName,
  };

  return {
    type: NotificationType.ENROLLED,
    title: "Kamu terdaftar di training",
    message: `Kamu telah didaftarkan pada training "${input.trainingName}". Segera mulai belajar.`,
    data,
  };
}

export function buildNewRegistrationNotification(input: {
  userName: string;
  email: string;
}) {
  const data: NotificationData = {
    href: "/admin/users?status=pending",
    userName: input.userName,
    email: input.email,
  };

  return {
    type: NotificationType.NEW_REGISTRATION,
    title: "Registrasi baru",
    message: `${input.userName} (${input.email}) mendaftar dan menunggu persetujuan.`,
    data,
  };
}

export function buildAccountApprovedNotification() {
  const data: NotificationData = {
    href: getDashboardPath("student"),
  };

  return {
    type: NotificationType.ACCOUNT_APPROVED,
    title: "Akun disetujui",
    message:
      "Akun kamu telah disetujui. Sekarang kamu bisa mengakses training.",
    data,
  };
}

export function buildCertificateIssuedNotification(input: {
  studentId: string;
  trainingId: string;
  trainingName: string;
  certificateId: string;
}) {
  const data: NotificationData = {
    href: `/student/trainings/${input.trainingId}`,
    trainingId: input.trainingId,
    trainingName: input.trainingName,
    certificateId: input.certificateId,
    dedupKey: `certificate_issued:${input.trainingId}:${input.studentId}`,
  };

  return {
    type: NotificationType.CERTIFICATE_ISSUED,
    title: "Sertifikat terbit",
    message: `Selamat! Sertifikat untuk training "${input.trainingName}" telah terbit.`,
    data,
  };
}

export function buildStudentCertificateIssuedNotification(input: {
  studentId: string;
  studentName: string;
  trainingId: string;
  trainingName: string;
}) {
  const data: NotificationData = {
    href: `/trainer/trainings/${input.trainingId}/modules`,
    trainingId: input.trainingId,
    trainingName: input.trainingName,
    studentId: input.studentId,
    studentName: input.studentName,
    dedupKey: `student_certificate_issued:${input.trainingId}:${input.studentId}`,
  };

  return {
    type: NotificationType.STUDENT_CERTIFICATE_ISSUED,
    title: "Peserta dapat sertifikat",
    message: `${input.studentName} menyelesaikan training "${input.trainingName}" dan mendapatkan sertifikat.`,
    data,
  };
}

export function buildProjectSubmittedNotification(input: {
  studentId: string;
  studentName: string;
  trainingId: string;
  trainingName: string;
}) {
  const data: NotificationData = {
    href: `/trainer/projects?trainingId=${input.trainingId}`,
    trainingId: input.trainingId,
    trainingName: input.trainingName,
    studentId: input.studentId,
    studentName: input.studentName,
  };

  return {
    type: NotificationType.PROJECT_SUBMITTED,
    title: "Project dikumpulkan",
    message: `${input.studentName} mengumpulkan project pada training "${input.trainingName}".`,
    data,
  };
}

export function buildFeedbackSubmittedNotification(input: {
  studentId: string;
  studentName: string;
  trainingId: string;
  trainingName: string;
}) {
  const data: NotificationData = {
    href: `/trainer/feedback?trainingId=${input.trainingId}`,
    trainingId: input.trainingId,
    trainingName: input.trainingName,
    studentId: input.studentId,
    studentName: input.studentName,
  };

  return {
    type: NotificationType.FEEDBACK_SUBMITTED,
    title: "Feedback masuk",
    message: `${input.studentName} memberikan feedback pada training "${input.trainingName}".`,
    data,
  };
}

// --- Tier 2 --------------------------------------------------------------

export function buildPostTestResultNotification(input: {
  attemptId: string;
  trainingId: string;
  trainingName: string;
  score: number;
  passingGrade: number;
  passed: boolean;
}) {
  const data: NotificationData = {
    href: `/student/trainings/${input.trainingId}`,
    trainingId: input.trainingId,
    trainingName: input.trainingName,
    score: input.score,
    passingGrade: input.passingGrade,
    passed: input.passed,
    dedupKey: `post_test_result:${input.attemptId}`,
  };

  return {
    type: NotificationType.POST_TEST_RESULT,
    title: input.passed ? "Post-test lulus" : "Post-test belum lulus",
    message: input.passed
      ? `Kamu lulus post-test training "${input.trainingName}" dengan nilai ${input.score}.`
      : `Nilai post-test kamu ${input.score}, passing grade ${input.passingGrade}. Kamu bisa mencoba lagi.`,
    data,
  };
}

export function buildPostTestResultStaffNotification(input: {
  attemptId: string;
  studentId: string;
  studentName: string;
  trainingId: string;
  trainingName: string;
  score: number;
  passed: boolean;
}) {
  const data: NotificationData = {
    href: `/trainer/trainings/${input.trainingId}/modules`,
    trainingId: input.trainingId,
    trainingName: input.trainingName,
    studentId: input.studentId,
    studentName: input.studentName,
    score: input.score,
    passed: input.passed,
    dedupKey: `post_test_result_staff:${input.attemptId}`,
  };

  return {
    type: NotificationType.POST_TEST_RESULT_STAFF,
    title: "Hasil post-test peserta",
    message: `${input.studentName} ${input.passed ? "lulus" : "belum lulus"} post-test "${input.trainingName}" (nilai ${input.score}).`,
    data,
  };
}

export function buildTrainingPublishedNotification(input: {
  trainingId: string;
  trainingName: string;
}) {
  const data: NotificationData = {
    href: `/student/trainings/${input.trainingId}`,
    trainingId: input.trainingId,
    trainingName: input.trainingName,
    dedupKey: `training_published:${input.trainingId}`,
  };

  return {
    type: NotificationType.TRAINING_PUBLISHED,
    title: "Training dibuka",
    message: `Training "${input.trainingName}" sudah dibuka. Kamu bisa mulai mengerjakan.`,
    data,
  };
}

export function buildVideoConferenceScheduledNotification(input: {
  trainingId: string;
  moduleId: string;
  moduleName: string;
  scheduledAt: string;
  scheduledLabel: string;
}) {
  const data: NotificationData = {
    href: `/student/trainings/${input.trainingId}`,
    trainingId: input.trainingId,
    moduleId: input.moduleId,
    moduleName: input.moduleName,
    scheduledAt: input.scheduledAt,
    dedupKey: `vc_scheduled:${input.moduleId}:${input.scheduledAt}`,
  };

  return {
    type: NotificationType.VIDEO_CONFERENCE_SCHEDULED,
    title: "Jadwal video conference",
    message: `Sesi video conference untuk modul "${input.moduleName}" dijadwalkan ${input.scheduledLabel}.`,
    data,
  };
}

// --- Tier 3 --------------------------------------------------------------

function isUserRole(role: string): role is UserRole {
  return role === "admin" || role === "trainer" || role === "student";
}

export function buildRoleChangedNotification(input: { role: string }) {
  const data: NotificationData = {
    href: isUserRole(input.role) ? getDashboardPath(input.role) : "/",
    role: input.role,
  };

  return {
    type: NotificationType.ROLE_CHANGED,
    title: "Peran akun diubah",
    message: `Peran akun kamu diubah menjadi ${
      isUserRole(input.role) ? ROLE_LABELS[input.role] : input.role
    }.`,
    data,
  };
}

export function buildAccountDeactivatedNotification() {
  const data: NotificationData = {
    href: "/login",
  };

  return {
    type: NotificationType.ACCOUNT_DEACTIVATED,
    title: "Akun dinonaktifkan",
    message:
      "Akun kamu dinonaktifkan. Hubungi admin untuk informasi lebih lanjut.",
    data,
  };
}

export function getDeadlineReminderDays(
  deadline: string,
  today: Date = new Date(),
): DeadlineReminderDay[] {
  const daysLeft = getCalendarDaysUntilDeadline(deadline, today);

  if (daysLeft === 3) {
    return [3];
  }

  if (daysLeft === 1) {
    return [1];
  }

  return [];
}

export function getCalendarDaysUntilDeadline(
  deadline: string,
  today: Date = new Date(),
): number {
  const [year, month, day] = deadline.split("-").map(Number);
  if (!year || !month || !day) {
    return Number.POSITIVE_INFINITY;
  }

  const deadlineDate = new Date(year, month - 1, day);
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffMs = deadlineDate.getTime() - todayDate.getTime();

  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}
