import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listModules } from "@/lib/application/modules/list-modules";
import { listTrainings } from "@/lib/application/trainings/list-trainings";

export default async function TrainerVideoConferencePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const trainingsResult = await listTrainings(user, { page: 1, pageSize: 50 });
  if (!trainingsResult.success) {
    redirect("/unauthorized");
  }

  const conferences = await Promise.all(
    trainingsResult.data.items.map(async (training) => {
      const modulesResult = await listModules(user, { trainingId: training.id });
      const modules =
        modulesResult.success && modulesResult.data.length > 0
          ? modulesResult.data.filter((module) => module.videoConferenceLink)
          : [];

      return { training, modules };
    }),
  );

  const items = conferences.filter((entry) => entry.modules.length > 0);

  return (
    <>
      <TrainerHeader
        title="Video Conference"
        breadcrumbs={[{ label: "Video Conference" }]}
        user={user}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-4xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title="Video Conference"
            description="Kelola link Google Meet atau Zoom per modul."
          />

          {items.length === 0 ? (
            <Card>
              <CardContent className="space-y-4 p-6 text-center text-sm text-muted-foreground">
                <p>Belum ada link video conference pada modul manapun.</p>
                <ButtonLink href="/trainer/modules">Kelola Modul</ButtonLink>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {items.map(({ training, modules }) => (
                <Card key={training.id}>
                  <CardContent className="space-y-3 p-6">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold">{training.title}</h3>
                      <ButtonLink
                        variant="outline"
                        size="xs"
                        href={`/trainer/trainings/${training.id}/modules`}
                      >
                        Edit Modul
                      </ButtonLink>
                    </div>
                    <ul className="space-y-2">
                      {modules.map((module) => (
                        <li
                          key={module.id}
                          className="rounded-lg border p-3 text-sm"
                        >
                          <p className="font-medium">{module.title}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {module.videoConferenceLink}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
