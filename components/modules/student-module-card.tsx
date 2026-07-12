import {
  IconBook,
  IconChevronRight,
  IconClipboardCheck,
  IconLock,
  IconPencil,
} from "@tabler/icons-react";

import { AssessmentProgressBadge } from "@/components/progress/assessment-progress-badge";
import { ButtonLink } from "@/components/ui/button-link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { StudentModuleListItem } from "@/lib/application/modules/list-student-modules";
import type { ModuleProgressStatus } from "@/lib/domain/modules/types";
import type { ModuleProgressItem } from "@/lib/domain/trainings/progress-types";
import { cn } from "@/lib/utils";

const STATUS_OVERLAY: Record<
  ModuleProgressStatus,
  { label: string; className: string }
> = {
  not_started: {
    label: "Belum dimulai",
    className: "bg-white text-slate-700 ring-1 ring-black/10",
  },
  in_progress: {
    label: "Sedang berjalan",
    className: "bg-amber-500 text-white ring-1 ring-black/10",
  },
  completed: {
    label: "Selesai",
    className: "bg-emerald-600 text-white ring-1 ring-black/10",
  },
};

type StudentModuleCardProps = {
  module: StudentModuleListItem;
  trainingId: string;
  trainingTitle?: string;
  preTestLocked?: boolean;
  progressItem?: ModuleProgressItem;
};

function getLockMessage(preTestLocked: boolean, isLocked: boolean) {
  if (preTestLocked) {
    return "Selesaikan pre-test untuk membuka modul.";
  }

  if (isLocked) {
    return "Selesaikan modul sebelumnya terlebih dahulu.";
  }

  return null;
}

export function StudentModuleCard({
  module,
  trainingId,
  trainingTitle,
  preTestLocked = false,
  progressItem,
}: StudentModuleCardProps) {
  const status = module.progress?.status ?? "not_started";
  const locked = preTestLocked || module.isLocked;
  const lockMessage = getLockMessage(preTestLocked, module.isLocked);
  const contentCount = module.contents.length;
  const href = `/student/trainings/${trainingId}/modules/${module.id}`;

  return (
    <Card
      className={cn(
        "group/module flex h-full min-w-0 w-full flex-col gap-0 overflow-hidden pt-0 transition-all duration-200",
        locked
          ? "bg-muted/30"
          : "hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/25",
      )}
    >
      <div className="relative aspect-16/10 w-full overflow-hidden bg-muted">
        {module.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={module.thumbnail}
            alt={module.title}
            className={cn(
              "h-full w-full object-cover transition-transform duration-300",
              !locked && "group-hover/module:scale-[1.03]",
              locked && "scale-105 blur-[1px]",
            )}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/15 via-muted to-accent/40">
            <div className="rounded-2xl bg-background/70 p-3 text-primary shadow-sm ring-1 ring-primary/10 backdrop-blur-sm">
              <IconBook className="size-7" />
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/45 via-black/5 to-black/10" />

        <div className="absolute top-3 right-3 z-10">
          {locked ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/85 px-2.5 py-1 text-[0.7rem] font-semibold text-white shadow-md ring-1 ring-white/20 backdrop-blur-sm">
              <IconLock className="size-3.5" />
              Terkunci
            </span>
          ) : (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold shadow-md",
                STATUS_OVERLAY[status].className,
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  status === "not_started" ? "bg-slate-400" : "bg-white/90",
                )}
              />
              {STATUS_OVERLAY[status].label}
            </span>
          )}
        </div>

        {locked ? (
          <div className="absolute inset-0 z-5 flex items-center justify-center bg-background/35 backdrop-blur-[2px]">
            <div className="rounded-full bg-background/90 p-3 text-muted-foreground shadow-sm ring-1 ring-foreground/10">
              <IconLock className="size-5" />
            </div>
          </div>
        ) : null}
      </div>

      <CardHeader className="gap-2 pt-4">
        {trainingTitle ? (
          <p className="text-[0.65rem] font-semibold tracking-[0.08em] text-primary/80 uppercase">
            {trainingTitle}
          </p>
        ) : null}
        <CardTitle className="line-clamp-2 text-base leading-snug font-semibold">
          {module.title}
        </CardTitle>
        {module.description ? (
          <CardDescription className="line-clamp-2 text-sm">
            {module.description}
          </CardDescription>
        ) : null}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <IconBook className="size-3.5 shrink-0 text-primary/70" />
            {contentCount} materi
          </span>
        </div>

        {lockMessage ? (
          <p className="rounded-md border border-dashed border-border/80 bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
            {lockMessage}
          </p>
        ) : null}

        {progressItem && !locked ? (
          <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <IconClipboardCheck className="size-3.5 shrink-0 text-muted-foreground" />
              <AssessmentProgressBadge
                status={progressItem.quiz.status}
                className="max-w-full truncate"
              />
            </div>
            <div className="flex min-w-0 items-center gap-1.5">
              <IconPencil className="size-3.5 shrink-0 text-muted-foreground" />
              <AssessmentProgressBadge
                status={progressItem.latihan.status}
                className="max-w-full truncate"
              />
            </div>
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="mt-auto border-t bg-muted/15 pt-4">
        {locked ? (
          <span
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full cursor-not-allowed opacity-60",
            )}
          >
            <IconLock data-icon="inline-start" className="size-4" />
            Modul Terkunci
          </span>
        ) : (
          <ButtonLink className="w-full" href={href}>
            Buka Modul
            <IconChevronRight
              data-icon="inline-end"
              className="size-4 transition-transform group-hover/module:translate-x-0.5"
            />
          </ButtonLink>
        )}
      </CardFooter>
    </Card>
  );
}
