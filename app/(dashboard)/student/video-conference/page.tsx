import { redirect } from "next/navigation";

import { IconClock, IconExternalLink } from "@tabler/icons-react";

import { formatVideoConferenceSchedule } from "@/lib/domain/modules/format-video-conference-schedule";
import { isVideoConferenceStarted } from "@/lib/domain/modules/video-conference-access";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StudentHeader } from "@/components/student/student-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ListPagination } from "@/components/ui/list-pagination";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listStudentModules } from "@/lib/application/modules/list-student-modules";
import { listEnrolledTrainings } from "@/lib/application/trainings/list-enrolled-trainings";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

type StudentVideoConferencePageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function StudentVideoConferencePage({
  searchParams,
}: StudentVideoConferencePageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const trainingsResult = await listEnrolledTrainings(user, {
    page,
    pageSize: PAGE_SIZE,
  });

  if (!trainingsResult.success) {
    redirect("/unauthorized");
  }

  const { items: trainings, total, totalPages } = trainingsResult.data;
  const now = new Date();

  const conferences = await Promise.all(
    trainings.map(async (training) => {
      const modulesResult = await listStudentModules(user, {
        trainingId: training.id,
      });
      const modules =
        modulesResult.success && modulesResult.data.length > 0
          ? modulesResult.data.filter(
              (module) =>
                module.videoConferenceLink && module.videoConferenceScheduledAt,
            )
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
            description="Jadwal video conference Google Meet atau Zoom per modul training."
          />

          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Menampilkan{" "}
                    <span className="font-medium text-foreground">
                      {items.length}
                    </span>{" "}
                    dari{" "}
                    <span className="font-medium text-foreground">{total}</span>{" "}
                    training
                  </p>
                </div>

                {items.length === 0 ? (
                  <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Belum ada jadwal video conference yang tersedia.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {items.map(({ training, modules }) => (
                      <Card key={training.id}>
                        <CardContent className="space-y-3 p-6">
                          <h3 className="font-semibold">{training.title}</h3>
                          <ul className="space-y-2">
                            {modules.map((module) => {
                              const started = isVideoConferenceStarted(
                                module.videoConferenceScheduledAt,
                                now,
                              );

                              return (
                                <li
                                  key={module.id}
                                  className="flex items-center justify-between gap-3 rounded-lg border p-3"
                                >
                                  <div className="min-w-0">
                                    <p className="font-medium">{module.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatVideoConferenceSchedule(
                                        module.videoConferenceScheduledAt!,
                                      )}
                                    </p>
                                    {started ? (
                                      <p className="truncate text-xs text-muted-foreground">
                                        {module.videoConferenceLink}
                                      </p>
                                    ) : (
                                      <p className="text-xs text-amber-600 dark:text-amber-500">
                                        Link aktif saat jadwal dimulai.
                                      </p>
                                    )}
                                  </div>
                                  {started ? (
                                    <a
                                      href={module.videoConferenceLink!}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={buttonVariants({
                                        variant: "outline",
                                        size: "xs",
                                      })}
                                    >
                                      <IconExternalLink className="size-3.5" />
                                      Buka
                                    </a>
                                  ) : (
                                    <span
                                      aria-disabled="true"
                                      className={cn(
                                        buttonVariants({
                                          variant: "outline",
                                          size: "xs",
                                        }),
                                        "pointer-events-none opacity-60",
                                      )}
                                    >
                                      <IconClock className="size-3.5" />
                                      Belum dimulai
                                    </span>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <ListPagination
                  page={page}
                  totalPages={totalPages}
                  basePath="/student/video-conference"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
