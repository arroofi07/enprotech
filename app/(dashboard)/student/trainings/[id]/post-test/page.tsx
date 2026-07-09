import { StudentTrainingAssessmentPage } from "@/components/assessments/student-training-assessment-page";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function StudentTrainingPostTestPage({ params }: PageProps) {
  return (
    <StudentTrainingAssessmentPage params={params} assessmentType="post_test" />
  );
}
