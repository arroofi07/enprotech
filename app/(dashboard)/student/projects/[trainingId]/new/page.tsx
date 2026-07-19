import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProjectSubmitForm } from "@/components/projects/project-submit-form";
import { StudentHeader } from "@/components/student/student-header";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listStudentProjectsByTraining } from "@/lib/application/projects/get-student-project";
import { getStudentTrainingFlowState } from "@/lib/application/training-flow/get-student-training-flow-state";
import { MAX_PROJECTS_PER_TRAINING } from "@/lib/domain/projects/limits";
import { canAccessProject } from "@/lib/domain/training-flow/gates";
import { findEnrollmentSummary } from "@/lib/infrastructure/db/repositories/report-repository";

type NewProjectPageProps = {
  params: Promise<{ trainingId: string }>;
};

export default async function NewProjectPage({ params }: NewProjectPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { trainingId } = await params;

  const enrollment = await findEnrollmentSummary(user.id, trainingId);
  if (!enrollment) {
    redirect("/student/projects");
  }

  const [projectsResult, flow] = await Promise.all([
    listStudentProjectsByTraining(user, trainingId),
    getStudentTrainingFlowState(user.id, trainingId),
  ]);
  if (!projectsResult.success) {
    redirect("/unauthorized");
  }

  if (
    !flow ||
    !canAccessProject({
      allModulesCompleted: flow.allModulesCompleted,
      hasPassedPostTest: flow.hasPassedPostTest,
    })
  ) {
    redirect("/student/projects");
  }

  // Already at the cap — send back to the manager.
  if (projectsResult.data.length >= MAX_PROJECTS_PER_TRAINING) {
    redirect(`/student/projects/${trainingId}`);
  }

  return (
    <>
      <StudentHeader
        title="Project"
        breadcrumbs={[
          { label: "Project", href: "/student/projects" },
          { label: enrollment.trainingTitle, href: `/student/projects/${trainingId}` },
          { label: "Tambah" },
        ]}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-3xl min-w-0 space-y-6 p-4 sm:p-6 md:p-8">
          <AdminPageHeader
            title="Tambah Project"
            description={`${enrollment.trainingTitle} · project ke-${projectsResult.data.length + 1} dari ${MAX_PROJECTS_PER_TRAINING}`}
            actions={
              <ButtonLink
                variant="outline"
                href={`/student/projects/${trainingId}`}
              >
                Kembali
              </ButtonLink>
            }
          />

          <Card>
            <CardContent className="p-4 sm:p-6">
              <ProjectSubmitForm
                trainingId={trainingId}
                trainingTitle={enrollment.trainingTitle}
                project={null}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
