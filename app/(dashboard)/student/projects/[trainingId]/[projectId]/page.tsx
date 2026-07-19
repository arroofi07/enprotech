import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProjectSubmitForm } from "@/components/projects/project-submit-form";
import { StudentHeader } from "@/components/student/student-header";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { getStudentProjectById } from "@/lib/application/projects/get-student-project";
import { getStudentTrainingFlowState } from "@/lib/application/training-flow/get-student-training-flow-state";
import { canAccessProject } from "@/lib/domain/training-flow/gates";
import { findEnrollmentSummary } from "@/lib/infrastructure/db/repositories/report-repository";

type EditProjectPageProps = {
  params: Promise<{ trainingId: string; projectId: string }>;
};

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { trainingId, projectId } = await params;

  const enrollment = await findEnrollmentSummary(user.id, trainingId);
  if (!enrollment) {
    redirect("/student/projects");
  }

  const [projectResult, flow] = await Promise.all([
    getStudentProjectById(user, projectId),
    getStudentTrainingFlowState(user.id, trainingId),
  ]);

  if (
    !flow ||
    !canAccessProject({
      allModulesCompleted: flow.allModulesCompleted,
      hasPassedPostTest: flow.hasPassedPostTest,
    })
  ) {
    redirect("/student/projects");
  }

  // Project must exist, belong to this student, and match the training in the URL.
  if (!projectResult.success || projectResult.data.trainingId !== trainingId) {
    redirect(`/student/projects/${trainingId}`);
  }

  return (
    <>
      <StudentHeader
        title="Project"
        breadcrumbs={[
          { label: "Project", href: "/student/projects" },
          { label: enrollment.trainingTitle, href: `/student/projects/${trainingId}` },
          { label: "Edit" },
        ]}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-3xl min-w-0 space-y-6 p-4 sm:p-6 md:p-8">
          <AdminPageHeader
            title="Edit Project"
            description={enrollment.trainingTitle}
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
                project={projectResult.data}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
