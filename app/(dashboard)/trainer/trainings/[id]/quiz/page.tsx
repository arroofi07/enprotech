import { TrainerTrainingModuleAssessmentHubPage } from "@/components/assessments/trainer-training-module-assessment-hub-page";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; search?: string }>;
};

export default function TrainerTrainingQuizPage({
  params,
  searchParams,
}: PageProps) {
  return (
    <TrainerTrainingModuleAssessmentHubPage
      type="quiz"
      params={params}
      searchParams={searchParams}
    />
  );
}
