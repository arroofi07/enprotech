import { TrainerTrainingModuleAssessmentHubPage } from "@/components/assessments/trainer-training-module-assessment-hub-page";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; search?: string }>;
};

export default function TrainerTrainingLatihanPage({
  params,
  searchParams,
}: PageProps) {
  return (
    <TrainerTrainingModuleAssessmentHubPage
      type="latihan"
      params={params}
      searchParams={searchParams}
    />
  );
}
