import type { TablerIcon } from "@tabler/icons-react";
import type { ReactNode } from "react";

type DashboardEmptyStateProps = {
  icon: TablerIcon;
  title: string;
  description: string;
  action?: ReactNode;
};

export function DashboardEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: DashboardEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="size-6" />
      </span>
      <p className="mt-4 text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
