import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { DashboardShell } from "@/components/auth/dashboard-shell";

export default async function TrainerDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardShell
      user={user}
      title="Dashboard Trainer"
      description="Kelola materi, jadwal training, quiz, dan latihan."
    />
  );
}
