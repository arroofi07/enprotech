import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StudentHeader } from "@/components/student/student-header";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { formatUserDisplayName } from "@/lib/domain/users/format-display-name";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <StudentHeader title="Dashboard" />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title="Dashboard Student"
            description="Ikuti training, kerjakan quiz, dan pantau progress Anda."
          />
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">
                Selamat datang,{" "}
                <span className="font-medium text-foreground">
                  {formatUserDisplayName(user)}
                </span>
                . Buka menu{" "}
                <span className="font-medium text-foreground">Modul</span>{" "}
                untuk melihat program yang sudah Anda ikuti.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
