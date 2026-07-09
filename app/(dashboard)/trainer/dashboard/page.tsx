import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { formatUserDisplayName } from "@/lib/domain/users/format-display-name";

export default async function TrainerDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <TrainerHeader title="Dashboard" user={user} />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title="Dashboard Trainer"
            description="Kelola training, modul, dan enrollment student."
          />
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">
                Selamat datang,{" "}
                <span className="font-medium text-foreground">
                  {formatUserDisplayName(user)}
                </span>
                . Mulai dari menu{" "}
                <span className="font-medium text-foreground">Training</span>{" "}
                untuk membuat atau mengelola program pembelajaran.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
