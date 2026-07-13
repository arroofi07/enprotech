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

export const trainingFeedback = pgTable(
  "training_feedback",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    trainingId: uuid("training_id")
      .notNull()
      .references(() => trainings.id, { onDelete: "cascade" }),
    trainingRating: integer("training_rating").notNull(),
    trainerRating: integer("trainer_rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique("training_feedback_student_training_unique").on(
      table.studentId,
      table.trainingId,
    ),
  ],
);

export type TrainingFeedback = typeof trainingFeedback.$inferSelect;
export type NewTrainingFeedback = typeof trainingFeedback.$inferInsert;
