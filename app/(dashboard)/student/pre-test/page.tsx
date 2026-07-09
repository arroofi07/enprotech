import { redirect } from "next/navigation";

import { LearningFlowPlaceholder } from "@/components/dashboard/learning-flow-placeholder";
import { StudentHeader } from "@/components/student/student-header";
import { getCurrentUser } from "@/lib/application/auth/get-session";

export default async function StudentPreTestPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      <StudentHeader title="Pre Test" breadcrumbs={[{ label: "Pre Test" }]} />
      <main className="flex-1 overflow-auto">
        <LearningFlowPlaceholder
          title="Pre Test"
          description="Kerjakan pre-test sebelum memulai modul pertama. Hanya dapat dikerjakan satu kali."
          taskId="T06"
        />
      </main>
    </>
  );
}
