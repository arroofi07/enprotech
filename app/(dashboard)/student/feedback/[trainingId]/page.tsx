import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { FeedbackSubmitForm } from "@/components/feedback/feedback-submit-form";
import { StudentHeader } from "@/components/student/student-header";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { getStudentFeedback } from "@/lib/application/feedback/get-student-feedback";
import { findEnrollmentSummary } from "@/lib/infrastructure/db/repositories/report-repository";

type StudentFeedbackFormPageProps = {
  params: Promise<{ trainingId: string }>;
};

export default async function StudentFeedbackFormPage({
  params,
}: StudentFeedbackFormPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { trainingId } = await params;

  const enrollment = await findEnrollmentSummary(user.id, trainingId);
  if (!enrollment) {
    redirect("/student/feedback");
  }

  const feedbackResult = await getStudentFeedback(user, trainingId);
  if (!feedbackResult.success) {
    redirect("/unauthorized");
  }

  const feedback = feedbackResult.data;

  return (
    <>
      <StudentHeader
        title="Feedback"
        breadcrumbs={[
          { label: "Feedback", href: "/student/feedback" },
          { label: enrollment.trainingTitle },
        ]}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-3xl min-w-0 space-y-6 p-4 sm:p-6 md:p-8">
          <AdminPageHeader
            title={feedback ? "Edit Feedback" : "Isi Feedback"}
            description={enrollment.trainingTitle}
            actions={
              <ButtonLink variant="outline" href="/student/feedback">
                Kembali
              </ButtonLink>
            }
          />

          <Card>
            <CardContent className="p-6">
              <FeedbackSubmitForm
                trainingId={trainingId}
                trainingTitle={enrollment.trainingTitle}
                feedback={feedback}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
