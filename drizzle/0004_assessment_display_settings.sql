ALTER TABLE "assessments" ADD COLUMN "question_display_count" integer;
ALTER TABLE "assessments" ADD COLUMN "shuffle_questions" boolean DEFAULT false NOT NULL;
ALTER TABLE "assessment_attempts" ADD COLUMN "question_ids" jsonb;
