import { TrainingAssessmentHubPage } from "@/components/assessments/training-assessment-hub-page";

type PageProps = {
  searchParams: Promise<{ page?: string; search?: string }>;
};

export default async function TrainerPreTestHubPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  return (
    <TrainingAssessmentHubPage
      assessmentType="pre_test"
      role="trainer"
      searchParams={params}
    />
  );
}
