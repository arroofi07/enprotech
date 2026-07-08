import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { trainings } from "./trainings";
import { users } from "./users";

export const certificates = pgTable("certificates", {
  id: uuid("id").defaultRandom().primaryKey(),
  certificateNumber: text("certificate_number").notNull().unique(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  trainingId: uuid("training_id")
    .notNull()
    .references(() => trainings.id, { onDelete: "cascade" }),
  issuedAt: timestamp("issued_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  preTestScore: integer("pre_test_score").notNull(),
  postTestScore: integer("post_test_score").notNull(),
  finalGrade: integer("final_grade").notNull(),
});

export type Certificate = typeof certificates.$inferSelect;
export type NewCertificate = typeof certificates.$inferInsert;
