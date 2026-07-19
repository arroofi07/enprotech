import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { trainings } from "./trainings";
import { users } from "./users";

// A student may upload up to MAX_PROJECTS_PER_TRAINING projects per training.
// The former unique(studentId, trainingId) constraint has been removed so a
// student can submit multiple projects; the per-training cap is enforced in the
// application layer (see lib/domain/projects/limits.ts).
export const studentProjects = pgTable("student_projects", {
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
});

export type StudentProject = typeof studentProjects.$inferSelect;
export type NewStudentProject = typeof studentProjects.$inferInsert;
