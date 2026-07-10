import { TrainerTrainingAssessmentPage } from "@/components/assessments/trainer-training-assessment-page";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default function TrainerPostTestPage({
  params,
  searchParams,
}: PageProps) {
  return (
    <TrainerTrainingAssessmentPage
      params={params}
      searchParams={searchParams}
      assessmentType="post_test"
    />
  );
}
