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
import { StudentHeader } from "@/components/student/student-header";
import { TrainingStatusBadge } from "@/components/trainings/training-status-badge";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Sedang Berjalan",
      value: inProgressCount,
      description: "Training masih dalam proses",
      icon: IconTrendingUp,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Selesai",
      value: completedCount,
      description: "Training sudah diselesaikan",
      icon: IconCircleCheck,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Progress Rata-rata",
      value: `${averageProgress}%`,
      description: "Rata-rata seluruh training",
      icon: IconChartBar,
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-600 dark:text-violet-400",
    },
  ] as const;

  const quickActions = [
    {
      title: "Pre Test",
      description: "Kerjakan pre-test training",
      href: "/student/pre-test",
      icon: IconClipboardCheck,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
    },
    {
      title: "Modul Pembelajaran",
      description: "Akses materi per training",
      href: "/student/modules",
      icon: IconBook,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
    },
    {
      title: "Quiz",
      description: "Kerjakan quiz modul",
      href: "/student/quiz",
      icon: IconListCheck,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600",
    },
    {
      title: "Latihan",
      description: "Kerjakan latihan modul",
      href: "/student/latihan",
      icon: IconPencil,
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-600",
    },
    {
      title: "Nilai",
      description: "Lihat hasil evaluasi",
      href: "/student/nilai",
      icon: IconChartBar,
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-600",
    },
    {
      title: "Sertifikat",
      description: "Unduh sertifikat lulus",
      href: "/student/certificates",
      icon: IconCertificate,
      iconBg: "bg-rose-500/10",
      iconColor: "text-rose-600",
    },
  ] as const;

  const featuredTrainings = trainings.slice(0, DASHBOARD_TRAINING_LIMIT);

  return (
    <>
      <StudentHeader title="Dashboard" />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl min-w-0 space-y-8 p-4 sm:p-6 md:p-8">
          <AdminPageHeader
            title={`Selamat datang, ${user.name.split(" ")[0]}!`}
            description="Pantau progress training, akses modul, dan kerjakan evaluasi dari satu tempat."
            actions={
              featuredTrainings.length > 0 ? (
                <ButtonLink size="lg" href={`/student/trainings/${featuredTrainings[0]!.id}`}>
                  Lanjutkan Belajar
                  <IconChevronRight data-icon="inline-end" className="size-4" />
                </ButtonLink>
              ) : null
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
                  <p className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
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
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Training Saya</CardTitle>
                  <CardDescription>
                    Daftar training yang sedang atau pernah Anda ikuti
                  </CardDescription>
                </div>
                {total > DASHBOARD_TRAINING_LIMIT ? (
                  <ButtonLink variant="outline" href="/student/trainings">
                    Lihat Semua
                    <IconChevronRight data-icon="inline-end" className="size-4" />
                  </ButtonLink>
                ) : null}
              </CardHeader>
              <CardContent>
                {featuredTrainings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-12">
                    <div className="rounded-full bg-muted p-4">
                      <IconSchool className="size-8 text-muted-foreground" />
                    </div>
                    <p className="mt-4 text-center text-sm font-medium text-muted-foreground">
                      Belum ada training terdaftar
                    </p>
                    <p className="mt-1 text-center text-xs text-muted-foreground">
                      Hubungi trainer untuk mendaftarkan Anda ke program pembelajaran
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {featuredTrainings.map((training) => {
                      const deadlineLabel = formatTrainingDeadline(training.deadline);

                      return (
                        <Link
                          key={training.id}
                          href={`/student/trainings/${training.id}`}
                          className="flex items-center justify-between gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                        >
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate font-medium">{training.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {training.completedItems} dari {training.totalItems} item
                                  selesai
                                  {deadlineLabel ? ` · Deadline ${deadlineLabel}` : ""}
                                </p>
                              </div>
                              <TrainingStatusBadge status={training.status} />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">{training.progressPercent}%</span>
                              </div>
                              <Progress value={training.progressPercent} />
                            </div>
                          </div>
                          <IconChevronRight className="size-5 shrink-0 text-muted-foreground" />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Aksi Cepat</CardTitle>
                <CardDescription>
                  Shortcut ke fitur pembelajaran yang sering digunakan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="flex items-center justify-between rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:bg-muted/50 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-10 items-center justify-center rounded-lg ${action.iconBg}`}
                      >
                        <action.icon className={`size-5 ${action.iconColor}`} />
                      </div>
                      <div>
                        <p className="font-medium">{action.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                    </div>
                    <IconChevronRight className="size-5 text-muted-foreground" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
