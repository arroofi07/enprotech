-- Allow a student to upload up to 4 projects per training.
-- Drop the unique(student_id, training_id) constraint so multiple rows are
-- permitted per (student, training). The per-training cap of 4 is enforced in
-- the application layer.
ALTER TABLE "student_projects" DROP CONSTRAINT IF EXISTS "student_projects_student_training_unique";
