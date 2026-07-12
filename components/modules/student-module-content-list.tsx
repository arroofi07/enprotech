"use client";

import {
  IconDownload,
  IconExternalLink,
  IconFileText,
  IconVideo,
} from "@tabler/icons-react";

import { buttonVariants } from "@/components/ui/button";
import type { ModuleContentRecord } from "@/lib/infrastructure/db/repositories/module-repository";
import { cn } from "@/lib/utils";

const TYPE_CONFIG = {
  document: {
    label: "Dokumen",
    icon: IconFileText,
    action: "Download",
  },
  video_link: {
    label: "Video",
    icon: IconVideo,
    action: "Tonton",
  },
  download_link: {
    label: "Download",
    icon: IconDownload,
    action: "Download",
  },
} as const;

type StudentModuleContentListProps = {
  contents: ModuleContentRecord[];
};

export function StudentModuleContentList({
  contents,
}: StudentModuleContentListProps) {
  if (contents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-12">
        <div className="rounded-full bg-muted p-4">
          <IconFileText className="size-8 text-muted-foreground" />
        </div>
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          Belum ada materi pembelajaran
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Materi akan ditambahkan oleh trainer
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {contents.map((content, index) => {
        const config = TYPE_CONFIG[content.type];
        const Icon = config.icon;

        return (
          <article
            key={content.id}
            className="group flex flex-col rounded-xl border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-muted/30"
          >
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Materi {index + 1} · {config.label}
                </p>
                <h4 className="font-medium leading-snug">{content.title}</h4>
                {content.fileSize ? (
                  <p className="text-xs text-muted-foreground">
                    {Math.round(content.fileSize / 1024)} KB
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-4">
              {content.type === "document" ? (
                <a
                  href={content.url}
                  download
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "w-full",
                  )}
                >
                  <IconDownload className="size-4" />
                  {config.action}
                </a>
              ) : (
                <a
                  href={content.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "w-full",
                  )}
                >
                  <IconExternalLink className="size-4" />
                  {config.action}
                </a>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
