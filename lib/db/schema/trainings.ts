import {
  boolean,
  date,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { enrollmentStatusEnum, trainingStatusEnum } from "./enums";
import { users } from "./users";

export const trainings = pgTable("trainings", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  thumbnail: text("thumbnail"),
  passingGrade: integer("passing_grade").notNull().default(70),
  deadline: date("deadline"),
  status: trainingStatusEnum("status").notNull().default("draft"),
  isPretestActive: boolean("is_pretest_active").notNull().default(false),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const enrollments = pgTable(
  "enrollments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    trainingId: uuid("training_id")
      .notNull()
      .references(() => trainings.id, { onDelete: "cascade" }),
    enrolledAt: timestamp("enrolled_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    status: enrollmentStatusEnum("status").notNull().default("enrolled"),
  },
  (table) => [
    unique("enrollments_student_training_unique").on(
      table.studentId,
      table.trainingId,
    ),
  ],
);

export type Training = typeof trainings.$inferSelect;
export type NewTraining = typeof trainings.$inferInsert;
export type Enrollment = typeof enrollments.$inferSelect;
export type NewEnrollment = typeof enrollments.$inferInsert;
