import Link from "next/link";
import { redirect } from "next/navigation";
import {
  IconBook,
  IconCertificate,
  IconChartBar,
  IconChevronRight,
  IconCircleCheck,
  IconClipboardCheck,
  IconListCheck,
  IconPencil,
  IconSchool,
  IconTrendingUp,
} from "@tabler/icons-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { DashboardMain } from "@/components/dashboard/dashboard-main";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { DashboardQuickLink } from "@/components/dashboard/dashboard-quick-link";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { StudentHeader } from "@/components/student/student-header";
import { TrainingStatusBadge } from "@/components/trainings/training-status-badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Progress } from "@/components/ui/progress";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listEnrolledTrainings } from "@/lib/application/trainings/list-enrolled-trainings";
import { formatTrainingDeadline } from "@/lib/domain/trainings/format-deadline";

const DASHBOARD_TRAINING_LIMIT = 6;

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const result = await listEnrolledTrainings(user, { page: 1, pageSize: 100 });

  if (!result.success) {
    redirect("/unauthorized");
  }

  const { items: trainings, total } = result.data;
  const completedCount = trainings.filter(
    (training) =>
      training.enrollmentStatus === "completed" || training.progressPercent === 100,
  ).length;
  const inProgressCount = trainings.filter(
    (training) =>
      training.enrollmentStatus === "in_progress" ||
      (training.progressPercent > 0 && training.progressPercent < 100),
  ).length;
  const averageProgress =
    trainings.length > 0
      ? Math.round(
          trainings.reduce((sum, training) => sum + training.progressPercent, 0) /
            trainings.length,
        )
      : 0;

  const stats = [
    {
      title: "Total Training",
      value: total,
      description: "Program yang Anda ikuti",
      icon: IconSchool,
    },
    {
      title: "Sedang Berjalan",
      value: inProgressCount,
      description: "Training masih dalam proses",
      icon: IconTrendingUp,
    },
    {
      title: "Selesai",
      value: completedCount,
      description: "Training sudah diselesaikan",
      icon: IconCircleCheck,
    },
    {
      title: "Progress Rata-rata",
      value: `${averageProgress}%`,
      description: "Rata-rata seluruh training",
      icon: IconChartBar,
    },
  ] as const;

  const quickActions = [
    {
      title: "Pre Test",
      description: "Kerjakan pre-test training",
      href: "/student/pre-test",
      icon: IconClipboardCheck,
    },
    {
      title: "Modul Pembelajaran",
      description: "Akses materi per training",
      href: "/student/modules",
      icon: IconBook,
    },
    {
      title: "Quiz",
      description: "Kerjakan quiz modul",
      href: "/student/quiz",
      icon: IconListCheck,
    },
    {
      title: "Latihan",
      description: "Kerjakan latihan modul",
      href: "/student/latihan",
      icon: IconPencil,
    },
    {
      title: "Nilai",
      description: "Lihat hasil evaluasi",
      href: "/student/nilai",
      icon: IconChartBar,
    },
    {
      title: "Sertifikat",
      description: "Unduh sertifikat lulus",
      href: "/student/certificates",
      icon: IconCertificate,
    },
  ] as const;

  const featuredTrainings = trainings.slice(0, DASHBOARD_TRAINING_LIMIT);

  return (
    <>
      <StudentHeader title="Dashboard" />
      <DashboardMain>
        <AdminPageHeader
          eyebrow="Dashboard Peserta"
          title={`Selamat datang, ${user.name.split(" ")[0]}!`}
          description="Pantau progress training, akses modul, dan kerjakan evaluasi dari satu tempat."
          actions={
            featuredTrainings.length > 0 ? (
              <ButtonLink
                size="lg"
                href={`/student/trainings/${featuredTrainings[0]!.id}`}
                className="rounded-full"
              >
                Lanjutkan Belajar
                <IconChevronRight data-icon="inline-end" className="size-4" />
              </ButtonLink>
            ) : null
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
            title="Training Saya"
            description="Daftar training yang sedang atau pernah Anda ikuti"
            actionHref={
              total > DASHBOARD_TRAINING_LIMIT ? "/student/trainings" : undefined
            }
          >
            {featuredTrainings.length === 0 ? (
              <DashboardEmptyState
                icon={IconSchool}
                title="Belum ada training terdaftar"
                description="Hubungi trainer untuk mendaftarkan Anda ke program pembelajaran"
              />
            ) : (
              <div className="space-y-2">
                {featuredTrainings.map((training) => {
                  const deadlineLabel = formatTrainingDeadline(training.deadline);

                  return (
                    <Link
                      key={training.id}
                      href={`/student/trainings/${training.id}`}
                      className="group flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-primary/5"
                    >
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-medium group-hover:text-primary">
                              {training.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {training.completedItems} dari {training.totalItems}{" "}
                              item selesai
                              {deadlineLabel ? ` · Deadline ${deadlineLabel}` : ""}
                            </p>
                          </div>
                          <TrainingStatusBadge status={training.status} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium tabular-nums">
                              {training.progressPercent}%
                            </span>
                          </div>
                          <Progress value={training.progressPercent} />
                        </div>
                      </div>
                      <IconChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                    </Link>
                  );
                })}
              </div>
            )}
          </DashboardPanel>

          <DashboardPanel
            className="lg:col-span-2"
            title="Aksi Cepat"
            description="Shortcut ke fitur pembelajaran"
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
