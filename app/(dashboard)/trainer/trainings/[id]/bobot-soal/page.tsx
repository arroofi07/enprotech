import { TrainerTrainingQuestionWeightPage } from "@/components/assessments/trainer-training-question-weight-page";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function TrainerTrainingBobotSoalPage({ params }: PageProps) {
  return <TrainerTrainingQuestionWeightPage params={params} />;
}
