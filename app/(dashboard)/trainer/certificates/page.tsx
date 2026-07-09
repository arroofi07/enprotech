import { redirect } from "next/navigation";

import { LearningFlowPlaceholder } from "@/components/dashboard/learning-flow-placeholder";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import { getCurrentUser } from "@/lib/application/auth/get-session";

export default async function TrainerCertificatesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <TrainerHeader
        title="Sertifikat"
        breadcrumbs={[{ label: "Sertifikat" }]}
        user={user}
      />
      <main className="flex-1 overflow-auto">
        <LearningFlowPlaceholder
          title="Sertifikat"
          description="Pantau sertifikat yang diterbitkan untuk student yang lulus."
          taskId="T10"
        />
      </main>
    </>
  );
}
