export const NotificationType = {
  MODULE_COMPLETED: "module_completed",
  DEADLINE_REMINDER: "deadline_reminder",
  ENROLLED: "enrolled",
  NEW_REGISTRATION: "new_registration",
  ACCOUNT_APPROVED: "account_approved",
  CERTIFICATE_ISSUED: "certificate_issued",
  STUDENT_CERTIFICATE_ISSUED: "student_certificate_issued",
  PROJECT_SUBMITTED: "project_submitted",
  FEEDBACK_SUBMITTED: "feedback_submitted",
  POST_TEST_RESULT: "post_test_result",
  POST_TEST_RESULT_STAFF: "post_test_result_staff",
  TRAINING_PUBLISHED: "training_published",
  VIDEO_CONFERENCE_SCHEDULED: "video_conference_scheduled",
  ROLE_CHANGED: "role_changed",
  ACCOUNT_DEACTIVATED: "account_deactivated",
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
  score?: number;
  passingGrade?: number;
  passed?: boolean;
  role?: string;
  email?: string;
  userName?: string;
  scheduledAt?: string;
  certificateId?: string;
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
