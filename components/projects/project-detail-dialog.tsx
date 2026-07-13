"use client";

import { IconExternalLink, IconFileText } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ProjectListItem } from "@/lib/infrastructure/db/repositories/project-repository";

type ProjectDetailDialogProps = {
  project: ProjectListItem;
};

function formatDate(value: Date): string {
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ProjectDetailDialog({ project }: ProjectDetailDialogProps) {
  return (
    <Dialog>
      <DialogTrigger render={<Button type="button" variant="outline" size="sm" />}>
        Detail
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{project.title ?? "Project Peserta"}</DialogTitle>
          <DialogDescription>
            {project.studentName} • {project.trainingTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="secondary">{project.trainingTitle}</Badge>
            <Badge variant="outline">
              Diperbarui {formatDate(project.updatedAt)}
            </Badge>
          </div>

          {project.description ? (
            <p className="text-sm text-muted-foreground">{project.description}</p>
          ) : null}

          <div className="space-y-2">
            <p className="text-sm font-medium">Gambar Project</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.imageUrl}
              alt={project.title ?? "Gambar project"}
              className="max-h-80 w-full rounded-lg border object-contain"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href={project.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 rounded-lg border p-3 text-sm font-medium transition-colors hover:bg-muted/50"
            >
              <span className="flex items-center gap-2">
                <IconExternalLink className="size-4 text-muted-foreground" />
                Buka Link Video
              </span>
            </a>
            <a
              href={project.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 rounded-lg border p-3 text-sm font-medium transition-colors hover:bg-muted/50"
            >
              <span className="flex items-center gap-2">
                <IconFileText className="size-4 text-muted-foreground" />
                Buka File PDF
              </span>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
