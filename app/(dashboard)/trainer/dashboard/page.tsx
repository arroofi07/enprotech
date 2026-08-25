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
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { DashboardMain } from "@/components/dashboard/dashboard-main";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { DashboardQuickLink } from "@/components/dashboard/dashboard-quick-link";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import { TrainingPublicationSummary } from "@/components/trainings/training-publication-summary";
import { TrainingStatusBadge } from "@/components/trainings/training-status-badge";
import { ButtonLink } from "@/components/ui/button-link";
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
    },
    {
      title: "Draft",
      value: draftTrainings,
      description: "Belum dipublikasikan",
      icon: IconFileText,
    },
    {
      title: "Aktif",
      value: activeTrainings,
      description: "Sedang berjalan",
      icon: IconWriting,
    },
    {
      title: "Selesai",
      value: completedTrainings,
      description: "Periode training selesai",
      icon: IconCircleCheck,
    },
  ] as const;

  const quickActions = [
    {
      title: "Buat Training",
      description: "Program pembelajaran baru",
      href: "/trainer/trainings/new",
      icon: IconSchool,
    },
    {
      title: "Kelola Modul",
      description: `${allTrainings} training terdaftar`,
      href: "/trainer/modules",
      icon: IconWriting,
    },
    {
      title: "Training Draft",
      description: `${draftTrainings} perlu dipublikasikan`,
      href: "/trainer/modules?status=draft",
      icon: IconFileText,
    },
    {
      title: "Training Aktif",
      description: `${activeTrainings} sedang berjalan`,
      href: "/trainer/modules?status=active",
      icon: IconCircleCheck,
    },
  ] as const;

  return (
    <>
      <TrainerHeader title="Dashboard" user={user} />
      <DashboardMain>
        <AdminPageHeader
          eyebrow="Dashboard Trainer"
          title={`Selamat datang, ${user.name.split(" ")[0]}!`}
          description="Ringkasan training dan akses cepat ke manajemen modul serta enrollment."
          actions={
            <ButtonLink
              size="lg"
              href="/trainer/trainings/new"
              className="rounded-full"
            >
              Buat Training
              <IconArrowRight data-icon="inline-end" />
            </ButtonLink>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <DashboardStatCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <DashboardPanel
            className="lg:col-span-3"
            title="Training Terbaru"
            description="Program yang baru dibuat atau diperbarui"
            actionHref="/trainer/modules"
          >
            {recentItems.length === 0 ? (
              <DashboardEmptyState
                icon={IconSchool}
                title="Belum ada training"
                description="Buat training pertama untuk mulai mengelola modul"
                action={
                  <ButtonLink href="/trainer/trainings/new" className="rounded-full">
                    Buat Training
                  </ButtonLink>
                }
              />
            ) : (
              <div className="space-y-2">
                {recentItems.map((training) => (
                  <Link
                    key={training.id}
                    href={`/trainer/trainings/${training.id}/edit`}
                    className="group block space-y-3 rounded-xl p-3 transition-colors hover:bg-primary/5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate font-medium group-hover:text-primary">
                          {training.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Passing grade {training.passingGrade}%
                          {formatTrainingDeadline(training.deadline)
                            ? ` · Deadline ${formatTrainingDeadline(training.deadline)}`
                            : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrainingStatusBadge status={training.status} />
                        <IconChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                      </div>
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
          </DashboardPanel>

          <DashboardPanel
            className="lg:col-span-2"
            title="Aksi Cepat"
            description="Shortcut ke fitur yang sering digunakan"
          >
            <div className="-mx-1 space-y-0.5">
              {quickActions.map((action) => (
                <DashboardQuickLink key={action.title} {...action} />
              ))}
            </div>
          </DashboardPanel>
        </div>
      </DashboardMain>
    </>
  );
}
