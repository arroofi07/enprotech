import { Suspense } from "react";
import { redirect } from "next/navigation";

import { DashboardNavigationLoading } from "@/components/loading/dashboard-navigation-loading";
import { DashboardSidebarSkeleton } from "@/components/loading/dashboard-sidebar-skeleton";
import { TrainerSidebar } from "@/components/trainer/trainer-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getCurrentUser } from "@/lib/application/auth/get-session";

async function TrainerSidebarSlot() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin" && user.role !== "trainer") {
    redirect("/unauthorized");
  }

  return <TrainerSidebar user={user} />;
}

export default function TrainerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <Suspense fallback={<DashboardSidebarSkeleton />}>
          <TrainerSidebarSlot />
        </Suspense>
        <SidebarInset>
          <DashboardNavigationLoading>{children}</DashboardNavigationLoading>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
