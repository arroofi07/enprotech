import { redirect } from "next/navigation";

import { LearningFlowPlaceholder } from "@/components/dashboard/learning-flow-placeholder";
import { StudentHeader } from "@/components/student/student-header";
import { getCurrentUser } from "@/lib/application/auth/get-session";

export default async function StudentLatihanPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      <StudentHeader
        title="Latihan"
        breadcrumbs={[{ label: "Latihan (Akhir Sesi)" }]}
      />
      <main className="flex-1 overflow-auto">
        <LearningFlowPlaceholder
          title="Latihan (Akhir Sesi)"
          description="Kerjakan latihan di akhir sesi modul. Dapat diulang hingga mencapai passing grade."
          taskId="T05"
        />
      </main>
    </>
  );
}
