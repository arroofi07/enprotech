"use client";

import { IconExternalLink, IconPhoto } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  if (modules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16">
        <div className="rounded-full bg-muted p-4">
          <IconPhoto className="size-8 text-muted-foreground" />
        </div>
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          Tidak ada modul yang cocok dengan filter.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-14">Urutan</TableHead>
            <TableHead className="w-20">Thumb</TableHead>
            <TableHead>Judul Modul</TableHead>
            <TableHead>Konten</TableHead>
            <TableHead>Video Conf.</TableHead>
            <TableHead>Diperbarui</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {modules.map((module) => {
            const summary = summarizeContents(module);

            return (
              <TableRow key={module.id} className="align-middle">
                <TableCell>
                  <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {module.order + 1}
                  </span>
                </TableCell>
                <TableCell>
                  {module.thumbnail ? (
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
                  )}
                </TableCell>
                <TableCell className="max-w-xs">
                  <p className="font-medium">{module.title}</p>
                  {module.description ? (
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {module.description}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Tanpa deskripsi
                    </p>
                  )}
                </TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell>
                  {module.videoConferenceLink ? (
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
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatUpdatedAt(module.updatedAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onManage(module)}
                  >
                    Kelola
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
