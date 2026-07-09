export type TrainingStatus = "draft" | "active" | "completed" | "archived";

export type EnrollmentStatus = "enrolled" | "in_progress" | "completed";

export const STUDENT_VISIBLE_TRAINING_STATUSES: TrainingStatus[] = [
  "active",
  "completed",
];
