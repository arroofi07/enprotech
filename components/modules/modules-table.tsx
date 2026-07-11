"use client";

import { IconExternalLink, IconPhoto } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { formatVideoConferenceSchedule } from "@/lib/domain/modules/format-video-conference-schedule";
import type { ModuleWithContents } from "@/lib/infrastructure/db/repositories/module-repository";

type ModulesTableProps = {
  modules: ModuleWithContents[];
  onManage: (module: ModuleWithContents) => void;
};

function summarizeContents(module: ModuleWithContents) {
  const documents = module.contents.filter((item) => item.type === "document")
    .length;
  const videos = module.contents.filter((item) => item.type === "video_link")
    .length;
  const downloads = module.contents.filter(
    (item) => item.type === "download_link",
  ).length;

  return { documents, videos, downloads, total: module.contents.length };
}

function formatUpdatedAt(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function ModulesTable({ modules, onManage }: ModulesTableProps) {
  return (
    <DataTable
      data={modules}
      getRowKey={(module) => module.id}
      emptyState={{
        message: "Tidak ada modul yang cocok dengan filter.",
        icon: IconPhoto,
      }}
      columns={[
        {
          id: "order",
          header: "Urutan",
          headerClassName: "w-14",
          className: "w-14",
          cell: (module) => (
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {module.order + 1}
            </span>
          ),
        },
        {
          id: "thumbnail",
          header: "Thumb",
          headerClassName: "w-20",
          className: "w-20",
          cell: (module) =>
            module.thumbnail ? (
              <div className="size-12 overflow-hidden rounded-md border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={module.thumbnail}
                  alt={module.title}
                  className="size-full object-cover"
                />
              </div>
            ) : (
              <div className="flex size-12 items-center justify-center rounded-md border border-dashed bg-muted/50">
                <IconPhoto className="size-4 text-muted-foreground" />
              </div>
            ),
        },
        {
          id: "title",
          header: "Nama Modul",
          className: "max-w-xs whitespace-normal",
          cell: (module) => (
            <div>
              <p className="font-medium">{module.title}</p>
              {module.description ? (
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  {module.description}
                </p>
              ) : (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Tanpa target pelatihan
                </p>
              )}
            </div>
          ),
        },
        {
          id: "contents",
          header: "Konten",
          className: "whitespace-normal",
          cell: (module) => {
            const summary = summarizeContents(module);

            return (
              <div className="space-y-1">
                <Badge variant="secondary">{summary.total} item</Badge>
                {summary.total > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {summary.documents} dok · {summary.videos} video ·{" "}
                    {summary.downloads} link
                  </p>
                ) : (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Belum ada materi
                  </p>
                )}
              </div>
            );
          },
        },
        {
          id: "videoConference",
          header: "Video Conf.",
          cell: (module) =>
            module.videoConferenceLink && module.videoConferenceScheduledAt ? (
              <div className="space-y-1">
                <Button
                  variant="outline"
                  size="xs"
                  render={
                    <a
                      href={module.videoConferenceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <IconExternalLink className="size-3.5" />
                  Meet/Zoom
                </Button>
                <p className="text-xs text-muted-foreground">
                  {formatVideoConferenceSchedule(
                    module.videoConferenceScheduledAt,
                  )}
                </p>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            ),
        },
        {
          id: "updatedAt",
          header: "Diperbarui",
          cell: (module) => (
            <span className="text-sm text-muted-foreground">
              {formatUpdatedAt(module.updatedAt)}
            </span>
          ),
        },
        {
          id: "actions",
          header: "Aksi",
          headerClassName: "text-right",
          className: "text-right",
          cell: (module) => (
            <Button variant="outline" size="sm" onClick={() => onManage(module)}>
              Kelola
            </Button>
          ),
        },
      ]}
    />
  );
}
