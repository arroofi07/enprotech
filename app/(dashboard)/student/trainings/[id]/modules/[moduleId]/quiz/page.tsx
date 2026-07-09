import { StudentAssessmentPage } from "@/components/assessments/student-assessment-page";

type PageProps = {
  params: Promise<{ id: string; moduleId: string }>;
};

export default function StudentQuizPage({ params }: PageProps) {
  return <StudentAssessmentPage params={params} assessmentType="quiz" />;
}
