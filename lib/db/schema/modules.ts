import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { moduleContentTypeEnum, moduleProgressStatusEnum } from "./enums";
import { trainings } from "./trainings";
import { users } from "./users";

export const modules = pgTable("modules", {
  id: uuid("id").defaultRandom().primaryKey(),
  trainingId: uuid("training_id")
    .notNull()
    .references(() => trainings.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  thumbnail: text("thumbnail"),
  videoConferenceLink: text("video_conference_link"),
  videoConferenceScheduledAt: timestamp("video_conference_scheduled_at", {
    withTimezone: true,
  }),
  videoConferenceEndedAt: timestamp("video_conference_ended_at", {
    withTimezone: true,
  }),
  minQuizScore: integer("min_quiz_score").notNull().default(0),
  minLatihanScore: integer("min_latihan_score").notNull().default(0),
  minAttendance: integer("min_attendance").notNull().default(0),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const moduleContents = pgTable("module_contents", {
  id: uuid("id").defaultRandom().primaryKey(),
  moduleId: uuid("module_id")
    .notNull()
    .references(() => modules.id, { onDelete: "cascade" }),
  type: moduleContentTypeEnum("type").notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  fileSize: integer("file_size"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const moduleProgress = pgTable("module_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  moduleId: uuid("module_id")
    .notNull()
    .references(() => modules.id, { onDelete: "cascade" }),
  status: moduleProgressStatusEnum("status").notNull().default("not_started"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export type Module = typeof modules.$inferSelect;
export type NewModule = typeof modules.$inferInsert;
export type ModuleContent = typeof moduleContents.$inferSelect;
export type NewModuleContent = typeof moduleContents.$inferInsert;
export type ModuleProgress = typeof moduleProgress.$inferSelect;
export type NewModuleProgress = typeof moduleProgress.$inferInsert;
