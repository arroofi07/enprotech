import { StudentAssessmentPage } from "@/components/assessments/student-assessment-page";

type PageProps = {
  params: Promise<{ id: string; moduleId: string }>;
};

export default function StudentLatihanPage({ params }: PageProps) {
  return <StudentAssessmentPage params={params} assessmentType="latihan" />;
}
