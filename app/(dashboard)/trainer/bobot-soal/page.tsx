import { TrainerQuestionWeightHubPage } from "@/components/assessments/trainer-question-weight-hub-page";

type PageProps = {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
};

export default async function TrainerBobotSoalHubPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  return <TrainerQuestionWeightHubPage searchParams={params} />;
}
