import { Suspense } from "react";
import { redirect } from "next/navigation";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { DashboardNavigationLoading } from "@/components/loading/dashboard-navigation-loading";
import { DashboardSidebarSkeleton } from "@/components/loading/dashboard-sidebar-skeleton";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getCurrentUser } from "@/lib/application/auth/get-session";

async function AdminSidebarSlot() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/unauthorized");
  }

  return <AdminSidebar user={user} />;
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <Suspense fallback={<DashboardSidebarSkeleton />}>
          <AdminSidebarSlot />
        </Suspense>
        <SidebarInset>
          <DashboardNavigationLoading>{children}</DashboardNavigationLoading>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
