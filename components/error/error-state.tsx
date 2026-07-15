import type { Icon } from "@tabler/icons-react";

import { cn } from "@/lib/utils";

type ErrorStateProps = {
  code: string;
  icon: Icon;
  title: string;
  description: string;
  digest?: string;
  tone?: "muted" | "destructive";
  actions?: React.ReactNode;
  className?: string;
};

export function ErrorState({
  code,
  icon: IconComponent,
  title,
  description,
  digest,
  tone = "muted",
  actions,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-full min-w-0 flex-1 items-center justify-center p-4 sm:p-6 md:p-8",
        className,
      )}
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
        <div
          className={cn(
            "flex size-12 items-center justify-center rounded-xl border",
            tone === "destructive"
              ? "border-destructive/20 bg-destructive/10 text-destructive"
              : "border-border bg-muted text-muted-foreground",
          )}
        >
          <IconComponent className="size-6" stroke={1.5} />
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <span className="font-mono text-[0.625rem] font-medium tracking-widest text-muted-foreground uppercase">
            Error {code}
          </span>
          <h1 className="font-heading text-xl font-semibold tracking-tight text-balance sm:text-2xl">
            {title}
          </h1>
          <p className="text-xs/relaxed text-muted-foreground text-balance">
            {description}
          </p>
        </div>

        {actions ? (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {actions}
          </div>
        ) : null}

        {digest ? (
          <p className="text-[0.625rem] text-muted-foreground">
            Kode referensi:{" "}
            <span className="font-mono text-foreground select-all">
              {digest}
            </span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
