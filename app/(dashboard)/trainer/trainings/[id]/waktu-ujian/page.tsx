import { TrainerTrainingTimeLimitPage } from "@/components/assessments/trainer-training-time-limit-page";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function TrainerTrainingWaktuUjianPage({ params }: PageProps) {
  return <TrainerTrainingTimeLimitPage params={params} />;
}
