import { redirect } from "next/navigation";

import { LearningFlowPlaceholder } from "@/components/dashboard/learning-flow-placeholder";
import { StudentHeader } from "@/components/student/student-header";
import { getCurrentUser } from "@/lib/application/auth/get-session";

export default async function StudentQuizPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      <StudentHeader
        title="Quiz"
        breadcrumbs={[{ label: "Quiz (Dalam Sesi)" }]}
      />
      <main className="flex-1 overflow-auto">
        <LearningFlowPlaceholder
          title="Quiz (Dalam Sesi)"
          description="Kerjakan quiz di setiap sesi modul untuk menguji pemahaman."
          taskId="T05"
        />
      </main>
    </>
  );
}
