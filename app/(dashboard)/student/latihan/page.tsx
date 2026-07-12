import { StudentAssessmentHubPage } from "@/components/assessments/student-assessment-hub-page";

type PageProps = {
  searchParams: Promise<{ page?: string; search?: string }>;
};

export default async function StudentLatihanHubPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  return <StudentAssessmentHubPage type="latihan" searchParams={params} />;
}
