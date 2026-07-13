CREATE TABLE "training_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"training_id" uuid NOT NULL,
	"training_rating" integer NOT NULL,
	"trainer_rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "training_feedback_student_training_unique" UNIQUE("student_id","training_id")
);
--> statement-breakpoint
ALTER TABLE "training_feedback" ADD CONSTRAINT "training_feedback_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_feedback" ADD CONSTRAINT "training_feedback_training_id_trainings_id_fk" FOREIGN KEY ("training_id") REFERENCES "public"."trainings"("id") ON DELETE cascade ON UPDATE no action;