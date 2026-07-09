import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StudentModuleView } from "@/components/modules/student-module-view";
import { StudentHeader } from "@/components/student/student-header";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { getStudentModule } from "@/lib/application/modules/list-student-modules";

type StudentModuleDetailPageProps = {
  params: Promise<{ id: string; moduleId: string }>;
};

export default async function StudentModuleDetailPage({
  params,
}: StudentModuleDetailPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id, moduleId } = await params;
  const result = await getStudentModule(user, { moduleId });

  if (!result.success) {
    redirect("/unauthorized");
  }

  return (
    <>
      <StudentHeader
        title={result.data.title}
        breadcrumbs={[
          { label: "Training Saya", href: "/student/trainings" },
          {
            label: "Modul",
            href: `/student/trainings/${id}`,
          },
          { label: result.data.title },
        ]}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-4xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title={result.data.title}
            description="Pelajari materi dan tandai modul selesai setelah selesai mempelajari."
            actions={
              <ButtonLink variant="outline" href={`/student/trainings/${id}`}>
                Daftar Modul
              </ButtonLink>
            }
          />

          <Card>
            <CardContent className="p-6">
              <StudentModuleView module={result.data} trainingId={id} />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
