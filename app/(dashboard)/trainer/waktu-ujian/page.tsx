import { TrainerTimeLimitHubPage } from "@/components/assessments/trainer-time-limit-hub-page";

type PageProps = {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
};

export default async function TrainerWaktuUjianHubPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  return <TrainerTimeLimitHubPage searchParams={params} />;
}
