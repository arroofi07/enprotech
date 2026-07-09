import Link from "next/link";
import { redirect } from "next/navigation";
import {
  IconArrowRight,
  IconUserCheck,
  IconUserOff,
  IconUsers,
  IconUserPlus,
  IconChevronRight,
} from "@tabler/icons-react";

import { AdminHeader } from "@/components/admin/admin-header";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listUsers } from "@/lib/application/users/list-users";
import { formatUserDisplayName } from "@/lib/domain/users/format-display-name";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [allUsers, pendingUsers, activeUsers, inactiveUsers] =
    await Promise.all([
      listUsers(user, { page: 1, pageSize: 1 }),
      listUsers(user, { status: "pending", page: 1, pageSize: 5 }),
      listUsers(user, { status: "active", page: 1, pageSize: 1 }),
      listUsers(user, { status: "inactive", page: 1, pageSize: 1 }),
    ]);

  const total = allUsers.success ? allUsers.data.total : 0;
  const pendingTotal = pendingUsers.success ? pendingUsers.data.total : 0;
  const activeTotal = activeUsers.success ? activeUsers.data.total : 0;
  const inactiveTotal = inactiveUsers.success ? inactiveUsers.data.total : 0;
  const pendingItems = pendingUsers.success ? pendingUsers.data.items : [];

  const stats = [
    {
      title: "Total Pengguna",
      value: total,
      description: "Semua akun terdaftar",
      icon: IconUsers,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-500/10",
    },
    {
      title: "Menunggu Approve",
      value: pendingTotal,
      description: "Perlu ditinjau Admin",
      icon: IconUserPlus,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-500/10",
    },
    {
      title: "Aktif",
      value: activeTotal,
      description: "Dapat login ke sistem",
      icon: IconUserCheck,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10",
    },
    {
      title: "Nonaktif",
      value: inactiveTotal,
      description: "Diblokir dari login",
      icon: IconUserOff,
      color: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      iconBg: "bg-rose-500/10",
    },
  ] as const;

  return (
    <>
      <AdminHeader title="Dashboard" />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl space-y-8 p-6 md:p-8">
          <AdminPageHeader
            title={`Selamat datang, ${user.name.split(" ")[0]}!`}
            description="Ringkasan sistem dan akses cepat ke manajemen pengguna."
            actions={
              <ButtonLink size="lg" href="/admin/users">
                Kelola Pengguna
                <IconArrowRight data-icon="inline-end" />
              </ButtonLink>
            }
          />

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.title} className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardDescription className="text-sm font-medium">
                    {stat.title}
                  </CardDescription>
                  <div className={`rounded-lg p-2 ${stat.iconBg}`}>
                    <stat.icon className={`size-5 ${stat.color.split(" ").slice(1).join(" ")}`} />
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

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Pending Approvals - Takes more space */}
            <Card className="lg:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Menunggu Persetujuan</CardTitle>
                  <CardDescription>
                    Pengguna baru yang belum dapat login
                  </CardDescription>
                </div>
                <ButtonLink variant="outline" href="/admin/users?status=pending">
                  Lihat Semua
                  <IconChevronRight data-icon="inline-end" className="size-4" />
                </ButtonLink>
              </CardHeader>
              <CardContent>
                {pendingItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-12">
                    <div className="rounded-full bg-muted p-4">
                      <IconUserCheck className="size-8 text-muted-foreground" />
                    </div>
                    <p className="mt-4 text-center text-sm font-medium text-muted-foreground">
                      Tidak ada permintaan approve saat ini
                    </p>
                    <p className="mt-1 text-center text-xs text-muted-foreground">
                      Semua pengguna sudah diproses
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10 font-medium text-amber-600">
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
                        <Badge variant="secondary" className="capitalize shrink-0">
                          {item.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Aksi Cepat</CardTitle>
                <CardDescription>
                  Shortcut ke fitur yang sering digunakan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  href="/admin/users"
                  className="flex items-center justify-between rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:bg-muted/50 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
                      <IconUsers className="size-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Semua Pengguna</p>
                      <p className="text-sm text-muted-foreground">
                        Lihat daftar lengkap
                      </p>
                    </div>
                  </div>
                  <IconChevronRight className="size-5 text-muted-foreground" />
                </Link>

                <Link
                  href="/admin/users?status=pending"
                  className="flex items-center justify-between rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:bg-muted/50 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
                      <IconUserPlus className="size-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium">Approve Pending</p>
                      <p className="text-sm text-muted-foreground">
                        {pendingTotal} menunggu
                      </p>
                    </div>
                  </div>
                  <IconChevronRight className="size-5 text-muted-foreground" />
                </Link>

                <Link
                  href="/admin/users?status=active"
                  className="flex items-center justify-between rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:bg-muted/50 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
                      <IconUserCheck className="size-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium">Pengguna Aktif</p>
                      <p className="text-sm text-muted-foreground">
                        {activeTotal} aktif
                      </p>
                    </div>
                  </div>
                  <IconChevronRight className="size-5 text-muted-foreground" />
                </Link>

                <Link
                  href="/admin/users?status=inactive"
                  className="flex items-center justify-between rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:bg-muted/50 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-rose-500/10">
                      <IconUserOff className="size-5 text-rose-600" />
                    </div>
                    <div>
                      <p className="font-medium">Akun Nonaktif</p>
                      <p className="text-sm text-muted-foreground">
                        {inactiveTotal} diblokir
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
