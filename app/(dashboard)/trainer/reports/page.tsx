import { redirect } from "next/navigation";

import { ComingSoonPanel } from "@/components/dashboard/coming-soon-panel";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import { getCurrentUser } from "@/lib/application/auth/get-session";

export default async function TrainerReportsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <TrainerHeader
        title="Rekap Hasil"
        breadcrumbs={[{ label: "Rekap Hasil" }]}
        user={user}
      />
      <main className="flex-1 overflow-auto">
        <ComingSoonPanel
          title="Rekap Hasil Training"
          description="Lihat dan export rekap nilai student per training, modul, dan periode."
          taskId="T09"
        />
      </main>
    </>
  );
}
