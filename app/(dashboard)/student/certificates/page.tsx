import { redirect } from "next/navigation";

import { LearningFlowPlaceholder } from "@/components/dashboard/learning-flow-placeholder";
import { StudentHeader } from "@/components/student/student-header";
import { getCurrentUser } from "@/lib/application/auth/get-session";

export default async function StudentCertificatesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <StudentHeader title="Sertifikat" breadcrumbs={[{ label: "Sertifikat" }]} />
      <main className="flex-1 overflow-auto">
        <LearningFlowPlaceholder
          title="Sertifikat"
          description="Unduh sertifikat setelah lulus post-test training."
          taskId="T10"
        />
      </main>
    </>
  );
}
