import {
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { trainings } from "./trainings";
import { users } from "./users";

export const studentProjects = pgTable(
  "student_projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    trainingId: uuid("training_id")
      .notNull()
      .references(() => trainings.id, { onDelete: "cascade" }),
    title: text("title"),
    description: text("description"),
    imageUrl: text("image_url").notNull(),
    videoUrl: text("video_url").notNull(),
    pdfUrl: text("pdf_url").notNull(),
    pdfFileSize: integer("pdf_file_size"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique("student_projects_student_training_unique").on(
      table.studentId,
      table.trainingId,
    ),
  ],
);

export type StudentProject = typeof studentProjects.$inferSelect;
export type NewStudentProject = typeof studentProjects.$inferInsert;
