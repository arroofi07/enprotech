ALTER TYPE "public"."training_status" ADD VALUE 'archived';--> statement-breakpoint
ALTER TABLE "trainings" ADD COLUMN "is_pretest_active" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_student_training_unique" UNIQUE("student_id","training_id");