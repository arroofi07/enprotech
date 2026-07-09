import type { AssessmentType } from "@/lib/domain/assessments/types";

export function getAssessmentTypeLabel(type: AssessmentType): string {
  switch (type) {
    case "quiz":
      return "Quiz";
    case "latihan":
      return "Latihan";
    case "pre_test":
      return "Pre-Test";
    case "post_test":
      return "Post-Test";
  }
}

export function getAssessmentTypeDescription(type: AssessmentType): string {
  switch (type) {
    case "quiz":
      return "Dikerjakan selama sesi pembelajaran untuk mengevaluasi pemahaman materi.";
    case "latihan":
      return "Dikerjakan di akhir sesi sebagai latihan mandiri dengan kesempatan retry.";
    case "pre_test":
      return "Assessment awal sebelum memulai modul. Hanya dapat dikerjakan satu kali.";
    case "post_test":
      return "Assessment akhir setelah menyelesaikan semua modul. Retry unlimited jika belum lulus.";
  }
}
