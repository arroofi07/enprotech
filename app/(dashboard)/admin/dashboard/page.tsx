import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { getDashboardPath } from "@/lib/domain/auth/permissions";
import { DashboardShell } from "@/components/auth/dashboard-shell";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardShell
      user={user}
      title="Dashboard Admin"
      description="Kelola pengguna, training, dan laporan sistem."
    />
  );
}
