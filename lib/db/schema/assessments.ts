import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { assessmentTypeEnum } from "./enums";
import { modules } from "./modules";
import { trainings } from "./trainings";
import { users } from "./users";

export type QuestionOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type AssessmentAnswer = {
  questionId: string;
  selectedOptionId: string;
};

export const assessments = pgTable("assessments", {
  id: uuid("id").defaultRandom().primaryKey(),
  trainingId: uuid("training_id")
    .notNull()
    .references(() => trainings.id, { onDelete: "cascade" }),
  moduleId: uuid("module_id").references(() => modules.id, {
    onDelete: "cascade",
  }),
  type: assessmentTypeEnum("type").notNull(),
  title: text("title").notNull(),
  passingGrade: integer("passing_grade"),
  timeLimit: integer("time_limit"),
  maxRetry: integer("max_retry"),
  questionDisplayCount: integer("question_display_count"),
  shuffleQuestions: boolean("shuffle_questions").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const questions = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  assessmentId: uuid("assessment_id")
    .notNull()
    .references(() => assessments.id, { onDelete: "cascade" }),
  questionText: text("question_text").notNull(),
  options: jsonb("options").$type<QuestionOption[]>().notNull(),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const assessmentAttempts = pgTable("assessment_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  assessmentId: uuid("assessment_id")
    .notNull()
    .references(() => assessments.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  answers: jsonb("answers").$type<AssessmentAnswer[]>().notNull(),
  questionIds: jsonb("question_ids").$type<string[]>(),
  startedAt: timestamp("started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
});

export type Assessment = typeof assessments.$inferSelect;
export type NewAssessment = typeof assessments.$inferInsert;
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type AssessmentAttempt = typeof assessmentAttempts.$inferSelect;
export type NewAssessmentAttempt = typeof assessmentAttempts.$inferInsert;
