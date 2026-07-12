import { TrainerAssessmentPage } from "@/components/assessments/trainer-assessment-page";

type PageProps = {
  params: Promise<{ id: string; moduleId: string }>;
  searchParams: Promise<{ page?: string; search?: string }>;
};

export default function TrainerQuizPage({ params, searchParams }: PageProps) {
  return (
    <TrainerAssessmentPage
      params={params}
      searchParams={searchParams}
      assessmentType="quiz"
    />
  );
}
