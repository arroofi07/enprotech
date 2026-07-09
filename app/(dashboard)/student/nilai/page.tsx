import { redirect } from "next/navigation";

import { LearningFlowPlaceholder } from "@/components/dashboard/learning-flow-placeholder";
import { StudentHeader } from "@/components/student/student-header";
import { getCurrentUser } from "@/lib/application/auth/get-session";

export default async function StudentNilaiPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      <StudentHeader title="Nilai" breadcrumbs={[{ label: "Nilai" }]} />
      <main className="flex-1 overflow-auto">
        <LearningFlowPlaceholder
          title="Nilai"
          description="Lihat nilai pre-test, quiz, latihan, dan post-test Anda."
          taskId="T07"
        />
      </main>
    </>
  );
}
