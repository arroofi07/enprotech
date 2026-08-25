import type { TablerIcon } from "@tabler/icons-react";

type DashboardStatCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: TablerIcon;
};

export function DashboardStatCard({
  title,
  value,
  description,
  icon: Icon,
}: DashboardStatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur-sm transition-colors hover:border-primary/25">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-8 size-24 rounded-full bg-primary/8 blur-2xl transition-opacity group-hover:opacity-100"
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-3">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {title}
          </p>
          <p className="font-heading text-3xl font-semibold tracking-tight text-foreground tabular-nums sm:text-4xl">
            {value}
          </p>
          <p className="text-sm leading-snug text-muted-foreground">
            {description}
          </p>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  );
}
