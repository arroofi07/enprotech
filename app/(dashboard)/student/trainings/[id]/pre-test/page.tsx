import { StudentTrainingAssessmentPage } from "@/components/assessments/student-training-assessment-page";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function StudentTrainingPreTestPage({ params }: PageProps) {
  return (
    <StudentTrainingAssessmentPage params={params} assessmentType="pre_test" />
  );
}
