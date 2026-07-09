import { redirect } from "next/navigation";

import { ComingSoonPanel } from "@/components/dashboard/coming-soon-panel";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import { getCurrentUser } from "@/lib/application/auth/get-session";

export default async function TrainerImportPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <TrainerHeader
        title="Import Excel"
        breadcrumbs={[{ label: "Import Excel" }]}
        user={user}
      />
      <main className="flex-1 overflow-auto">
        <ComingSoonPanel
          title="Import Data Excel"
          description="Import soal quiz/latihan, enrollment, dan nilai training dari file Excel."
          taskId="T11"
        />
      </main>
    </>
  );
}
