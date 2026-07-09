import { redirect } from "next/navigation";

import { LearningFlowPlaceholder } from "@/components/dashboard/learning-flow-placeholder";
import { StudentHeader } from "@/components/student/student-header";
import { getCurrentUser } from "@/lib/application/auth/get-session";

export default async function StudentPostTestPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      <StudentHeader title="Post Test" breadcrumbs={[{ label: "Post Test" }]} />
      <main className="flex-1 overflow-auto">
        <LearningFlowPlaceholder
          title="Post Test"
          description="Kerjakan post-test setelah menyelesaikan semua modul untuk mendapatkan sertifikat."
          taskId="T06"
        />
      </main>
    </>
  );
}
