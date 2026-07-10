import { TrainerAssessmentHubPage } from "@/components/assessments/trainer-assessment-hub-page";

type PageProps = {
  searchParams: Promise<{ page?: string; search?: string }>;
};

export default async function TrainerQuizHubPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  return <TrainerAssessmentHubPage type="quiz" searchParams={params} />;
}
