import { TrainerAssessmentPage } from "@/components/assessments/trainer-assessment-page";

type PageProps = {
  params: Promise<{ id: string; moduleId: string }>;
};

export default function TrainerQuizPage({ params }: PageProps) {
  return <TrainerAssessmentPage params={params} assessmentType="quiz" />;
}
