import Link from "next/link";
import { redirect } from "next/navigation";
import {
  IconArrowRight,
  IconChevronRight,
  IconCircleCheck,
  IconFileText,
  IconSchool,
  IconWriting,
} from "@tabler/icons-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import { TrainingPublicationSummary } from "@/components/trainings/training-publication-summary";
import { TrainingStatusBadge } from "@/components/trainings/training-status-badge";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listTrainings } from "@/lib/application/trainings/list-trainings";
import { formatTrainingDeadline } from "@/lib/domain/trainings/format-deadline";
import { getTrainingPublicationSummaries } from "@/lib/infrastructure/db/repositories/assessment-repository";
import { countTrainingsByStatus } from "@/lib/infrastructure/db/repositories/training-repository";

export default async function TrainerDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [
    draftCount,
    activeCount,
    completedCount,
    archivedCount,
    recentTrainings,
  ] = await Promise.all([
    countTrainingsByStatus("draft"),
    countTrainingsByStatus("active"),
    countTrainingsByStatus("completed"),
    countTrainingsByStatus("archived"),
    listTrainings(user, { page: 1, pageSize: 5 }),
  ]);

  const allTrainings = draftCount + activeCount + completedCount + archivedCount;
  const draftTrainings = draftCount;
  const activeTrainings = activeCount;
  const completedTrainings = completedCount;

  const recentItems = recentTrainings.success ? recentTrainings.data.items : [];
  const publicationSummaries = await getTrainingPublicationSummaries(
    recentItems.map((training) => training.id),
  );

  const stats = [
    {
      title: "Total Training",
      value: allTrainings,
      description: "Semua program pembelajaran",
      icon: IconSchool,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Draft",
      value: draftTrainings,
      description: "Belum dipublikasikan",
      icon: IconFileText,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Aktif",
      value: activeTrainings,
      description: "Sedang berjalan",
      icon: IconWriting,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Selesai",
      value: completedTrainings,
      description: "Periode training selesai",
      icon: IconCircleCheck,
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-600 dark:text-violet-400",
    },
  ] as const;

  return (
    <>
      <TrainerHeader title="Dashboard" user={user} />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl space-y-8 p-6 md:p-8">
          <AdminPageHeader
            title={`Selamat datang, ${user.name.split(" ")[0]}!`}
            description="Ringkasan training dan akses cepat ke manajemen modul serta enrollment."
            actions={
              <ButtonLink size="lg" href="/trainer/trainings/new">
                Buat Training
                <IconArrowRight data-icon="inline-end" />
              </ButtonLink>
            }
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.title} className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardDescription className="text-sm font-medium">
                    {stat.title}
                  </CardDescription>
                  <div className={`rounded-lg p-2 ${stat.iconBg}`}>
                    <stat.icon className={`size-5 ${stat.iconColor}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="font-heading text-4xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            <Card className="lg:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Training Terbaru</CardTitle>
                  <CardDescription>
                    Program yang baru dibuat atau diperbarui
                  </CardDescription>
                </div>
                <ButtonLink variant="outline" href="/trainer/modules">
                  Lihat Semua
                  <IconChevronRight data-icon="inline-end" className="size-4" />
                </ButtonLink>
              </CardHeader>
              <CardContent>
                {recentItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-12">
                    <div className="rounded-full bg-muted p-4">
                      <IconSchool className="size-8 text-muted-foreground" />
                    </div>
                    <p className="mt-4 text-center text-sm font-medium text-muted-foreground">
                      Belum ada training
                    </p>
                    <p className="mt-1 text-center text-xs text-muted-foreground">
                      Buat training pertama untuk mulai mengelola modul
                    </p>
                    <ButtonLink className="mt-4" href="/trainer/trainings/new">
                      Buat Training
                    </ButtonLink>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentItems.map((training) => (
                      <Link
                        key={training.id}
                        href={`/trainer/trainings/${training.id}/edit`}
                        className="block space-y-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {training.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Passing grade {training.passingGrade}%
                              {formatTrainingDeadline(training.deadline)
                                ? ` · Deadline ${formatTrainingDeadline(training.deadline)}`
                                : ""}
                            </p>
                          </div>
                          <TrainingStatusBadge status={training.status} />
                        </div>
                        {publicationSummaries[training.id] ? (
                          <TrainingPublicationSummary
                            summary={publicationSummaries[training.id]}
                            compact
                          />
                        ) : null}
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Aksi Cepat</CardTitle>
                <CardDescription>
                  Shortcut ke fitur yang sering digunakan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  href="/trainer/trainings/new"
                  className="flex items-center justify-between rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:bg-muted/50 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
                      <IconSchool className="size-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Buat Training</p>
                      <p className="text-sm text-muted-foreground">
                        Program pembelajaran baru
                      </p>
                    </div>
                  </div>
                  <IconChevronRight className="size-5 text-muted-foreground" />
                </Link>

                <Link
                  href="/trainer/modules"
                  className="flex items-center justify-between rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:bg-muted/50 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
                      <IconWriting className="size-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium">Kelola Modul</p>
                      <p className="text-sm text-muted-foreground">
                        {allTrainings} training terdaftar
                      </p>
                    </div>
                  </div>
                  <IconChevronRight className="size-5 text-muted-foreground" />
                </Link>

                <Link
                  href="/trainer/modules?status=draft"
                  className="flex items-center justify-between rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:bg-muted/50 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
                      <IconFileText className="size-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium">Training Draft</p>
                      <p className="text-sm text-muted-foreground">
                        {draftTrainings} perlu dipublikasikan
                      </p>
                    </div>
                  </div>
                  <IconChevronRight className="size-5 text-muted-foreground" />
                </Link>

                <Link
                  href="/trainer/modules?status=active"
                  className="flex items-center justify-between rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:bg-muted/50 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-violet-500/10">
                      <IconCircleCheck className="size-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="font-medium">Training Aktif</p>
                      <p className="text-sm text-muted-foreground">
                        {activeTrainings} sedang berjalan
                      </p>
                    </div>
                  </div>
                  <IconChevronRight className="size-5 text-muted-foreground" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
