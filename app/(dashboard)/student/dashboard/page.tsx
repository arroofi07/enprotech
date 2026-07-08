import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { DashboardShell } from "@/components/auth/dashboard-shell";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardShell
      user={user}
      title="Dashboard Student"
      description="Ikuti training, kerjakan quiz, dan akses sertifikat Anda."
    />
  );
}
