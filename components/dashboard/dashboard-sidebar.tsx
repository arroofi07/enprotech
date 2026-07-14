"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconLogout } from "@tabler/icons-react";

import { logoutAction } from "@/app/actions/auth";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import type { SessionUser } from "@/lib/domain/auth/types";
import { formatUserDisplayName } from "@/lib/domain/users/format-display-name";
import {
  getDashboardNav,
  isNavItemActive,
} from "@/lib/navigation/dashboard-nav";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

type DashboardSidebarProps = {
  user: SessionUser;
};

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { homeHref, shellLabel, groups } = getDashboardNav(user);

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Enprotech"
              className="h-auto py-3"
              render={<Link href={homeHref} />}
            >
              <BrandLogo
                priority
                className="h-10 w-auto max-w-36 shrink-0 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:max-w-8"
              />
              <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span className="text-xs text-sidebar-muted-foreground">
                  {shellLabel}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="px-3 text-xs font-medium uppercase tracking-wider text-sidebar-muted-foreground">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = isNavItemActive(pathname, item);

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.title}
                        className="h-10 text-sm [&_svg]:size-5"
                        render={<Link href={item.href} />}
                      >
                        <item.icon />
                        <span className="flex min-w-0 flex-1 items-center gap-2">
                          <span className="truncate">{item.title}</span>
                          {!item.implemented ? (
                            <Badge
                              variant="secondary"
                              className="ml-auto shrink-0 px-1.5 py-0 text-[10px] group-data-[collapsible=icon]:hidden"
                            >
                              Segera
                            </Badge>
                          ) : null}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarSeparator className="mb-3" />
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0">
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-medium">
              {formatUserDisplayName(user)}
            </span>
            <span className="truncate text-xs text-sidebar-muted-foreground">
              {user.email}
            </span>
          </div>
        </div>
        <SidebarMenu className="mt-2">
          <SidebarMenuItem>
            <form action={logoutAction} className="w-full">
              <SidebarMenuButton
                tooltip="Keluar"
                className="h-10 text-sm text-sidebar-destructive hover:bg-sidebar-destructive/15 hover:text-sidebar-destructive [&_svg]:size-5"
                render={<button type="submit" />}
              >
                <IconLogout />
                <span>Keluar</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
