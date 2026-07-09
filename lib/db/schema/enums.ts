import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "trainer",
  "student",
]);

export const userStatusEnum = pgEnum("user_status", [
  "pending",
  "active",
  "inactive",
]);

export const trainingStatusEnum = pgEnum("training_status", [
  "draft",
  "active",
  "completed",
  "archived",
]);

export const moduleContentTypeEnum = pgEnum("module_content_type", [
  "document",
  "video_link",
  "download_link",
]);

export const assessmentTypeEnum = pgEnum("assessment_type", [
  "pre_test",
  "quiz",
  "latihan",
  "post_test",
]);

export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "enrolled",
  "in_progress",
  "completed",
]);

export const moduleProgressStatusEnum = pgEnum("module_progress_status", [
  "not_started",
  "in_progress",
  "completed",
]);
