"use client";

import { useActionState } from "react";
import {
  IconEdit,
  IconFileText,
  IconLink,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";

import {
  deleteProjectFormAction,
  type ProjectActionState,
} from "@/app/actions/projects";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { useActionToast } from "@/hooks/use-action-toast";
import type { StudentProject } from "@/lib/db/schema/student-projects";

const initialState: ProjectActionState = {};

type StudentProjectManagerProps = {
  trainingId: string;
  projects: StudentProject[];
  maxProjects: number;
};

export function StudentProjectManager({
  trainingId,
  projects,
  maxProjects,
}: StudentProjectManagerProps) {
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteProjectFormAction,
    initialState,
  );

  useActionToast(deleteState);

  const canAddMore = projects.length < maxProjects;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Badge variant={projects.length >= maxProjects ? "default" : "secondary"}>
            {projects.length}/{maxProjects} project
          </Badge>
          <span className="text-muted-foreground">
            Anda dapat mengunggah maksimal {maxProjects} project untuk training
            ini.
          </span>
        </div>
        {canAddMore ? (
          <ButtonLink
            size="sm"
            href={`/student/projects/${trainingId}/new`}
            className="shrink-0"
          >
            <IconPlus data-icon="inline-start" />
            Tambah Project
          </ButtonLink>
        ) : (
          <Button size="sm" disabled className="shrink-0">
            <IconPlus data-icon="inline-start" />
            Maksimal {maxProjects} project
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconFileText />
            </EmptyMedia>
            <EmptyTitle>Belum ada project</EmptyTitle>
            <EmptyDescription>
              Unggah project pertama Anda (gambar, link video, dan file PDF)
              untuk training ini.
            </EmptyDescription>
          </EmptyHeader>
          <ButtonLink size="sm" href={`/student/projects/${trainingId}/new`}>
            <IconPlus data-icon="inline-start" />
            Tambah Project
          </ButtonLink>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="flex flex-col overflow-hidden rounded-lg border"
            >
              <div className="aspect-video w-full overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.imageUrl}
                  alt={project.title ?? `Project ${index + 1}`}
                  className="size-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="space-y-1">
                  <p className="line-clamp-1 font-medium">
                    {project.title ?? `Project ${index + 1}`}
                  </p>
                  {project.description ? (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {project.description}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <a
                    href={project.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    <IconLink className="size-3.5" />
                    Video
                  </a>
                  <a
                    href={project.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    <IconFileText className="size-3.5" />
                    PDF
                  </a>
                </div>

                <div className="mt-auto flex items-center gap-2 pt-2">
                  <ButtonLink
                    variant="outline"
                    size="xs"
                    href={`/student/projects/${trainingId}/${project.id}`}
                  >
                    <IconEdit data-icon="inline-start" />
                    Edit
                  </ButtonLink>

                  <AlertDialog>
                    <AlertDialogTrigger
                      render={<Button variant="ghost" size="xs" />}
                    >
                      <IconTrash data-icon="inline-start" />
                      Hapus
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus project?</AlertDialogTitle>
                        <AlertDialogDescription>
                          {project.title ?? `Project ${index + 1}`} akan dihapus
                          permanen. Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <form action={deleteAction}>
                          <input
                            type="hidden"
                            name="projectId"
                            value={project.id}
                          />
                          <Button
                            type="submit"
                            variant="destructive"
                            disabled={deletePending}
                          >
                            {deletePending ? (
                              <Spinner data-icon="inline-start" />
                            ) : null}
                            Hapus
                          </Button>
                        </form>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
