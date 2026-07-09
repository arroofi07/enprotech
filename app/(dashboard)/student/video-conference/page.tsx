import { redirect } from "next/navigation";

import { IconExternalLink } from "@tabler/icons-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StudentHeader } from "@/components/student/student-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listStudentModules } from "@/lib/application/modules/list-student-modules";
import { listEnrolledTrainings } from "@/lib/application/trainings/list-enrolled-trainings";

export default async function StudentVideoConferencePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const trainingsResult = await listEnrolledTrainings(user);
  if (!trainingsResult.success) {
    redirect("/unauthorized");
  }

  const conferences = await Promise.all(
    trainingsResult.data.map(async (training) => {
      const modulesResult = await listStudentModules(user, {
        trainingId: training.id,
      });
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
      <StudentHeader
        title="Video Conference"
        breadcrumbs={[{ label: "Video Conference" }]}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-4xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title="Video Conference"
            description="Link Google Meet atau Zoom untuk setiap modul training."
          />

          {items.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                Belum ada jadwal video conference yang tersedia.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {items.map(({ training, modules }) => (
                <Card key={training.id}>
                  <CardContent className="space-y-3 p-6">
                    <h3 className="font-semibold">{training.title}</h3>
                    <ul className="space-y-2">
                      {modules.map((module) => (
                        <li
                          key={module.id}
                          className="flex items-center justify-between gap-3 rounded-lg border p-3"
                        >
                          <div className="min-w-0">
                            <p className="font-medium">{module.title}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {module.videoConferenceLink}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="xs"
                            render={
                              <a
                                href={module.videoConferenceLink!}
                                target="_blank"
                                rel="noopener noreferrer"
                              />
                            }
                          >
                            <IconExternalLink className="size-3.5" />
                            Buka
                          </Button>
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
