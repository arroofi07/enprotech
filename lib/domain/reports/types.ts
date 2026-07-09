import type { ModuleProgressStatus } from "@/lib/domain/modules/types";
import type { EnrollmentStatus } from "@/lib/domain/trainings/types";

export type TrainingReportRow = {
  rowKey: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  trainingId: string;
  trainingTitle: string;
  moduleId: string;
  moduleTitle: string;
  moduleOrder: number;
  quizScore: number | null;
  latihanScore: number | null;
  moduleStatus: ModuleProgressStatus;
  enrollmentStatus: EnrollmentStatus;
  enrolledAt: string;
  completedAt: string | null;
};

export type TrainingReportAttempt = {
  id: string;
  attemptNumber: number;
  score: number;
  startedAt: string;
  submittedAt: string;
};

export type TrainingReportAssessmentDetail = {
  assessmentId: string;
  type: "pre_test" | "quiz" | "latihan" | "post_test";
  title: string;
  moduleId: string | null;
  moduleTitle: string | null;
  bestScore: number | null;
  passingGrade: number;
  hasPassed: boolean;
  attempts: TrainingReportAttempt[];
};

export type StudentReportDetail = {
  studentId: string;
  studentName: string;
  studentEmail: string;
  trainingId: string;
  trainingTitle: string;
  enrollmentStatus: EnrollmentStatus;
  enrolledAt: string;
  completedAt: string | null;
  assessments: TrainingReportAssessmentDetail[];
};

export type ReportExportFormat = "xlsx" | "pdf";

export type ReportExportRow = {
  studentName: string;
  studentEmail: string;
  trainingTitle: string;
  moduleTitle: string;
  quizScore: string;
  latihanScore: string;
  moduleStatus: string;
  enrollmentStatus: string;
  enrolledAt: string;
  completedAt: string;
};
