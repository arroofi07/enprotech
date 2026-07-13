import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProjectSubmitForm } from "@/components/projects/project-submit-form";
import { StudentHeader } from "@/components/student/student-header";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { getStudentProject } from "@/lib/application/projects/get-student-project";
import { findEnrollmentSummary } from "@/lib/infrastructure/db/repositories/report-repository";

type StudentProjectFormPageProps = {
  params: Promise<{ trainingId: string }>;
};

export default async function StudentProjectFormPage({
  params,
}: StudentProjectFormPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { trainingId } = await params;

  const enrollment = await findEnrollmentSummary(user.id, trainingId);
  if (!enrollment) {
    redirect("/student/projects");
  }

  const projectResult = await getStudentProject(user, trainingId);
  if (!projectResult.success) {
    redirect("/unauthorized");
  }

  const project = projectResult.data;

  return (
    <>
      <StudentHeader
        title="Project"
        breadcrumbs={[
          { label: "Project", href: "/student/projects" },
          { label: enrollment.trainingTitle },
        ]}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-3xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title={project ? "Edit Project" : "Upload Project"}
            description={enrollment.trainingTitle}
            actions={
              <ButtonLink variant="outline" href="/student/projects">
                Kembali
              </ButtonLink>
            }
          />

          <Card>
            <CardContent className="p-6">
              <ProjectSubmitForm
                trainingId={trainingId}
                trainingTitle={enrollment.trainingTitle}
                project={project}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
