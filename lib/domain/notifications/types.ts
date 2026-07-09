export const NotificationType = {
  MODULE_COMPLETED: "module_completed",
  DEADLINE_REMINDER: "deadline_reminder",
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export type DeadlineReminderDay = 3 | 1;

export type NotificationData = {
  href?: string;
  trainingId?: string;
  moduleId?: string;
  studentId?: string;
  studentName?: string;
  moduleName?: string;
  trainingName?: string;
  reminderDay?: DeadlineReminderDay;
  dedupKey?: string;
};

export type NotificationRecord = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: NotificationData | null;
  isRead: boolean;
  createdAt: Date;
};
