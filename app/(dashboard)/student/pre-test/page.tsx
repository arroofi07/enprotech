import { TrainingAssessmentHubPage } from "@/components/assessments/training-assessment-hub-page";

type PageProps = {
  searchParams: Promise<{ page?: string; search?: string }>;
};

export default async function StudentPreTestHubPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  return (
    <TrainingAssessmentHubPage
      assessmentType="pre_test"
      role="student"
      searchParams={params}
    />
  );
}
