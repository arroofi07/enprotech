import { TrainerTrainingAssessmentPage } from "@/components/assessments/trainer-training-assessment-page";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function TrainerPostTestPage({ params }: PageProps) {
  return (
    <TrainerTrainingAssessmentPage params={params} assessmentType="post_test" />
  );
}
