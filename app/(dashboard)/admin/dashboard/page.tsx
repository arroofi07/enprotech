import Link from "next/link";
import { redirect } from "next/navigation";
import {
  IconArrowRight,
  IconChevronRight,
  IconUserCheck,
  IconUserOff,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react";

import { AdminHeader } from "@/components/admin/admin-header";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { DashboardMain } from "@/components/dashboard/dashboard-main";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { DashboardQuickLink } from "@/components/dashboard/dashboard-quick-link";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { TrainingPublicationSummary } from "@/components/trainings/training-publication-summary";
import { TrainingStatusBadge } from "@/components/trainings/training-status-badge";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listTrainings } from "@/lib/application/trainings/list-trainings";
import { listUsers } from "@/lib/application/users/list-users";
import { formatUserDisplayName } from "@/lib/domain/users/format-display-name";
import { getTrainingPublicationSummaries } from "@/lib/infrastructure/db/repositories/assessment-repository";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [allUsers, pendingUsers, activeUsers, inactiveUsers, recentTrainings] =
    await Promise.all([
      listUsers(user, { page: 1, pageSize: 1 }),
      listUsers(user, { status: "pending", page: 1, pageSize: 5 }),
      listUsers(user, { status: "active", page: 1, pageSize: 1 }),
      listUsers(user, { status: "inactive", page: 1, pageSize: 1 }),
      listTrainings(user, { page: 1, pageSize: 5 }),
    ]);

  const total = allUsers.success ? allUsers.data.total : 0;
  const pendingTotal = pendingUsers.success ? pendingUsers.data.total : 0;
  const activeTotal = activeUsers.success ? activeUsers.data.total : 0;
  const inactiveTotal = inactiveUsers.success ? inactiveUsers.data.total : 0;
  const pendingItems = pendingUsers.success ? pendingUsers.data.items : [];
  const recentTrainingItems = recentTrainings.success
    ? recentTrainings.data.items
    : [];
  const publicationSummaries = await getTrainingPublicationSummaries(
    recentTrainingItems.map((training) => training.id),
  );

  const stats = [
    {
      title: "Total Pengguna",
      value: total,
      description: "Semua akun terdaftar",
      icon: IconUsers,
    },
    {
      title: "Menunggu Approve",
      value: pendingTotal,
      description: "Perlu ditinjau Admin",
      icon: IconUserPlus,
    },
    {
      title: "Aktif",
      value: activeTotal,
      description: "Dapat login ke sistem",
      icon: IconUserCheck,
    },
    {
      title: "Nonaktif",
      value: inactiveTotal,
      description: "Diblokir dari login",
      icon: IconUserOff,
    },
  ] as const;

  const quickActions = [
    {
      title: "Semua Pengguna",
      description: "Lihat daftar lengkap",
      href: "/admin/users",
      icon: IconUsers,
    },
    {
      title: "Approve Pending",
      description: `${pendingTotal} menunggu`,
      href: "/admin/users?status=pending",
      icon: IconUserPlus,
    },
    {
      title: "Pengguna Aktif",
      description: `${activeTotal} aktif`,
      href: "/admin/users?status=active",
      icon: IconUserCheck,
    },
    {
      title: "Akun Nonaktif",
      description: `${inactiveTotal} diblokir`,
      href: "/admin/users?status=inactive",
      icon: IconUserOff,
    },
  ] as const;

  return (
    <>
      <AdminHeader title="Dashboard" />
      <DashboardMain>
        <AdminPageHeader
          eyebrow="Dashboard Admin"
          title={`Selamat datang, ${user.name.split(" ")[0]}!`}
          description="Ringkasan sistem dan akses cepat ke manajemen pengguna."
          actions={
            <ButtonLink size="lg" href="/admin/users" className="rounded-full">
              Kelola Pengguna
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
            title="Menunggu Persetujuan"
            description="Pengguna baru yang belum dapat login"
            actionHref="/admin/users?status=pending"
          >
            {pendingItems.length === 0 ? (
              <DashboardEmptyState
                icon={IconUserCheck}
                title="Tidak ada permintaan approve saat ini"
                description="Semua pengguna sudah diproses"
              />
            ) : (
              <div className="space-y-2">
                {pendingItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 rounded-xl p-3 transition-colors hover:bg-primary/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {formatUserDisplayName(item)}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {item.email}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="shrink-0 capitalize">
                      {item.role}
                    </Badge>
                  </div>
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

        <DashboardPanel
          title="Kelengkapan Training Terbaru"
          description="Ringkasan modul dan soal sebelum training dipublikasikan"
          actionHref="/trainer/modules"
        >
          {recentTrainingItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Belum ada training.
            </p>
          ) : (
            <div className="space-y-2">
              {recentTrainingItems.map((training) => (
                <Link
                  key={training.id}
                  href={`/trainer/trainings/${training.id}/edit`}
                  className="group block space-y-3 rounded-xl p-3 transition-colors hover:bg-primary/5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="truncate font-medium group-hover:text-primary">
                      {training.title}
                    </p>
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
      </DashboardMain>
    </>
  );
}
