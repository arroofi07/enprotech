import { redirect } from "next/navigation";

import { LearningFlowPlaceholder } from "@/components/dashboard/learning-flow-placeholder";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import { getCurrentUser } from "@/lib/application/auth/get-session";

async function TrainerLearningPage({
  title,
  description,
  taskId,
}: {
  title: string;
  description: string;
  taskId: string;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      <TrainerHeader title={title} breadcrumbs={[{ label: title }]} user={user} />
      <main className="flex-1 overflow-auto">
        <LearningFlowPlaceholder
          title={title}
          description={description}
          taskId={taskId}
        />
      </main>
    </>
  );
}

export default function TrainerPreTestPage() {
  return (
    <TrainerLearningPage
      title="Pre Test"
      description="Kelola soal pre-test dan aktivasi pre-test per training."
      taskId="T06"
    />
  );
}
