import { TrainerAssessmentHubPage } from "@/components/assessments/trainer-assessment-hub-page";

type PageProps = {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
};

export default async function TrainerLatihanHubPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  return <TrainerAssessmentHubPage type="latihan" searchParams={params} />;
}
