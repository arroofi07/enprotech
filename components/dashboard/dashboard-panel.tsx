import { IconChevronRight } from "@tabler/icons-react";
import type { ReactNode } from "react";

import { ButtonLink } from "@/components/ui/button-link";

type DashboardPanelProps = {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  children: ReactNode;
  className?: string;
};

export function DashboardPanel({
  title,
  description,
  actionHref,
  actionLabel = "Lihat Semua",
  children,
  className,
}: DashboardPanelProps) {
  return (
    <section
      className={[
        "rounded-2xl border border-border/70 bg-card/80 shadow-sm backdrop-blur-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-start justify-between gap-4 border-b border-border/60 px-5 py-4 sm:px-6">
        <div className="min-w-0 space-y-1">
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            {title}
          </h2>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actionHref ? (
          <ButtonLink
            variant="ghost"
            href={actionHref}
            className="shrink-0 text-sm font-medium text-primary hover:text-primary"
          >
            {actionLabel}
            <IconChevronRight data-icon="inline-end" className="size-4" />
          </ButtonLink>
        ) : null}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}
