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
  const href = `/trainer/trainings/${input.trainingId}`;
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
