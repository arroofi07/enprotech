import Link from "next/link";
import type { TablerIcon } from "@tabler/icons-react";
import { IconChevronRight } from "@tabler/icons-react";

type DashboardQuickLinkProps = {
  href: string;
  title: string;
  description: string;
  icon: TablerIcon;
};

export function DashboardQuickLink({
  href,
  title,
  description,
  icon: Icon,
}: DashboardQuickLinkProps) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-primary/6"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">
          {title}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {description}
        </span>
      </span>
      <IconChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}
