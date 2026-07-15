import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProjectSubmitForm } from "@/components/projects/project-submit-form";
import { StudentHeader } from "@/components/student/student-header";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { getStudentProject } from "@/lib/application/projects/get-student-project";
import { getStudentTrainingFlowState } from "@/lib/application/training-flow/get-student-training-flow-state";
import { canAccessProject } from "@/lib/domain/training-flow/gates";
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

  const [projectResult, flow] = await Promise.all([
    getStudentProject(user, trainingId),
    getStudentTrainingFlowState(user.id, trainingId),
  ]);
  if (!projectResult.success) {
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
        <div className="container max-w-3xl min-w-0 space-y-6 p-4 sm:p-6 md:p-8">
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
