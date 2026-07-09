import { redirect } from "next/navigation";

import { TrainerSidebar } from "@/components/trainer/trainer-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getCurrentUser } from "@/lib/application/auth/get-session";

export default async function TrainerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin" && user.role !== "trainer") {
    redirect("/unauthorized");
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <TrainerSidebar user={user} />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
