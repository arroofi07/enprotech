export type ImportKind = "questions" | "enrollments" | "scores";

export type ImportRow<T> = {
  rowNumber: number;
  raw: Record<string, string>;
  data: T | null;
  errors: string[];
  isValid: boolean;
};

export type ImportPreview<T> = {
  rows: ImportRow<T>[];
  totalCount: number;
  validCount: number;
  invalidCount: number;
};

export type ImportCommitResult = {
  successCount: number;
  failedCount: number;
  skippedCount: number;
  errors: Array<{ rowNumber: number; message: string }>;
};

export type ParsedQuestionRow = {
  questionText: string;
  options: Array<{ text: string; isCorrect: boolean }>;
};

export type ParsedEnrollmentRow = {
  studentEmail: string;
  trainingId: string;
};

export type ParsedScoreRow = {
  studentEmail: string;
  trainingId: string;
  moduleName: string | null;
  assessmentType: "quiz" | "latihan" | "pre_test" | "post_test";
  score: number;
};
