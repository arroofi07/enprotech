import { NotificationBell } from "@/components/notifications/notification-bell";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

import type { SessionUser } from "@/lib/domain/auth/types";

type TrainerHeaderProps = {
  title: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  user?: SessionUser;
};

function getHomeCrumb(user?: SessionUser) {
  if (user?.role === "admin") {
    return { label: "Admin", href: "/admin/dashboard" as const };
  }

  return { label: "Trainer", href: "/trainer/dashboard" as const };
}

export function TrainerHeader({ title, breadcrumbs = [], user }: TrainerHeaderProps) {
  const home = getHomeCrumb(user);

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger className="-ml-2" />
      <Separator orientation="vertical" className="h-5" />
      <Breadcrumb>
        <BreadcrumbList className="text-sm">
          <BreadcrumbItem>
            <BreadcrumbLink href={home.href}>{home.label}</BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumbs.map((crumb) => (
            <span key={crumb.label} className="contents">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {crumb.href ? (
                  <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </span>
          ))}
          {breadcrumbs.length === 0 ? (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          ) : null}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto">
        <NotificationBell />
      </div>
    </header>
  );
}
