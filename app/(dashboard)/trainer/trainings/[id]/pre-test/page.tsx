import { TrainerTrainingAssessmentPage } from "@/components/assessments/trainer-training-assessment-page";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function TrainerPreTestPage({ params }: PageProps) {
  return (
    <TrainerTrainingAssessmentPage params={params} assessmentType="pre_test" />
  );
}
