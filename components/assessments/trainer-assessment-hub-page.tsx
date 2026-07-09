import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { getAssessmentTypeLabel } from "@/lib/domain/assessments/labels";
import type { AssessmentType } from "@/lib/domain/assessments/types";

type TrainerAssessmentHubPageProps = {
  type: AssessmentType;
};

export async function TrainerAssessmentHubPage({
  type,
}: TrainerAssessmentHubPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const typeLabel = getAssessmentTypeLabel(type);

  return (
    <>
      <TrainerHeader
        title={typeLabel}
        breadcrumbs={[{ label: typeLabel }]}
        user={user}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-3xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title={`Kelola ${typeLabel}`}
            description={`${typeLabel} dikelola per modul dalam setiap training.`}
          />
          <Card>
            <CardContent className="space-y-4 p-6">
              <p className="text-sm text-muted-foreground">
                Buka halaman modul training, lalu pilih modul yang ingin Anda
                kelola untuk menambah, mengedit, atau mengimpor soal{" "}
                {typeLabel.toLowerCase()}.
              </p>
              <ButtonLink href="/trainer/modules">Buka Daftar Training</ButtonLink>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
