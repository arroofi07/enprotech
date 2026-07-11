"use client";

import { useActionState } from "react";
import { IconExternalLink, IconTrash } from "@tabler/icons-react";

import {
  deleteModuleContentAction,
  type ModuleActionState,
} from "@/app/actions/modules";
import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useActionToast } from "@/hooks/use-action-toast";
import type { ModuleContentRecord } from "@/lib/infrastructure/db/repositories/module-repository";

const initialState: ModuleActionState = {};

const TYPE_LABELS = {
  document: "Dokumen",
  video_link: "Video",
  download_link: "Download",
} as const;

type ModuleContentListProps = {
  contents: ModuleContentRecord[];
  moduleId: string;
  trainingId: string;
  editable?: boolean;
};

export function ModuleContentList({
  contents,
  moduleId,
  trainingId,
  editable = false,
}: ModuleContentListProps) {
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteModuleContentAction,
    initialState,
  );

  useActionToast(deleteState);

  if (contents.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
        Belum ada konten.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {contents.map((content) => (
          <li
            key={content.id}
            className="flex items-center justify-between gap-3 rounded-lg border p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{content.title}</p>
              <p className="text-xs text-muted-foreground">
                {TYPE_LABELS[content.type]}
                {content.fileSize
                  ? ` · ${Math.round(content.fileSize / 1024)} KB`
                  : ""}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {content.type === "document" ? (
                <a
                  href={content.url}
                  download
                  className={buttonVariants({ variant: "outline", size: "xs" })}
                >
                  Download
                </a>
              ) : (
                <a
                  href={content.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "outline", size: "xs" })}
                >
                  <IconExternalLink className="size-3.5" />
                  Buka
                </a>
              )}

              {editable ? (
                <form action={deleteAction}>
                  <input type="hidden" name="contentId" value={content.id} />
                  <input type="hidden" name="moduleId" value={moduleId} />
                  <input type="hidden" name="trainingId" value={trainingId} />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon-xs"
                    disabled={deletePending}
                  >
                    {deletePending ? (
                      <Spinner className="size-3.5" />
                    ) : (
                      <IconTrash className="size-3.5" />
                    )}
                  </Button>
                </form>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
