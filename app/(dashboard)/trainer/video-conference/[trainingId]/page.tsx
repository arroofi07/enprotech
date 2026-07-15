import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { VideoConferenceManagementPanel } from "@/components/video-conference/video-conference-management-panel";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listModules } from "@/lib/application/modules/list-modules";
import { getTraining } from "@/lib/application/trainings/get-training";

type TrainerTrainingVideoConferencePageProps = {
  params: Promise<{ trainingId: string }>;
};

export default async function TrainerTrainingVideoConferencePage({
  params,
}: TrainerTrainingVideoConferencePageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { trainingId } = await params;
  const [trainingResult, modulesResult] = await Promise.all([
    getTraining(user, { trainingId }),
    listModules(user, { trainingId }),
  ]);

  if (!trainingResult.success || !modulesResult.success) {
    redirect("/unauthorized");
  }

  return (
    <>
      <TrainerHeader
        title={`Video Conference — ${trainingResult.data.title}`}
        breadcrumbs={[
          { label: "Video Conference", href: "/trainer/video-conference" },
          { label: trainingResult.data.title },
        ]}
        user={user}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-5xl min-w-0 space-y-6 p-4 sm:p-6 md:p-8">
          <AdminPageHeader
            title="Atur Video Conference"
            description={`Kelola jadwal video conference per modul untuk training "${trainingResult.data.title}".`}
            actions={
              <ButtonLink variant="outline" href="/trainer/video-conference">
                Kembali
              </ButtonLink>
            }
          />

          <Card>
            <CardContent className="p-6">
              <VideoConferenceManagementPanel
                trainingId={trainingId}
                trainingTitle={trainingResult.data.title}
                modules={modulesResult.data}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
