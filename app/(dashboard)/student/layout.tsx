import { Suspense } from "react";
import { redirect } from "next/navigation";

import { DashboardNavigationLoading } from "@/components/loading/dashboard-navigation-loading";
import { DashboardSidebarSkeleton } from "@/components/loading/dashboard-sidebar-skeleton";
import { StudentSidebar } from "@/components/student/student-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getCurrentUser } from "@/lib/application/auth/get-session";

async function StudentSidebarSlot() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "student") {
    redirect("/unauthorized");
  }

  return <StudentSidebar user={user} />;
}

export default function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <Suspense fallback={<DashboardSidebarSkeleton />}>
          <StudentSidebarSlot />
        </Suspense>
        <SidebarInset>
          <DashboardNavigationLoading>{children}</DashboardNavigationLoading>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
