import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StudentHeader } from "@/components/student/student-header";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { getAssessmentTypeLabel } from "@/lib/domain/assessments/labels";
import type { AssessmentType } from "@/lib/domain/assessments/types";

type StudentAssessmentHubPageProps = {
  type: AssessmentType;
};

export async function StudentAssessmentHubPage({
  type,
}: StudentAssessmentHubPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const typeLabel = getAssessmentTypeLabel(type);

  return (
    <>
      <StudentHeader
        title={typeLabel}
        breadcrumbs={[{ label: typeLabel }]}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-3xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title={typeLabel}
            description={`Kerjakan ${typeLabel.toLowerCase()} dari halaman modul pembelajaran Anda.`}
          />
          <Card>
            <CardContent className="space-y-4 p-6">
              <p className="text-sm text-muted-foreground">
                Buka modul pembelajaran, lalu pilih tombol &quot;Kerjakan{" "}
                {typeLabel}&quot; pada modul yang ingin Anda kerjakan.
              </p>
              <ButtonLink href="/student/modules">Buka Daftar Modul</ButtonLink>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
