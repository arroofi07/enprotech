"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { IconCheck, IconUpload, IconX } from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  formatProjectMaxFileSize,
  getProjectAllowedMimeTypes,
} from "@/lib/domain/projects/file-validation";
import type { ProjectFileKind } from "@/lib/domain/projects/types";
import { cn } from "@/lib/utils";

type ProjectFileUploadProps = {
  trainingId: string;
  kind: ProjectFileKind;
  onUploaded: (result: { url: string; size: number; fileName: string }) => void;
  onClear?: () => void;
  uploadedFileName?: string;
  disabled?: boolean;
};

const HINTS: Record<ProjectFileKind, string> = {
  image: "JPG, JPEG, PNG, WEBP · max 2 MB",
  pdf: "PDF · max 10 MB",
};

export function ProjectFileUpload({
  trainingId,
  kind,
  onUploaded,
  onClear,
  uploadedFileName,
  disabled = false,
}: ProjectFileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [localFileName, setLocalFileName] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) {
        return;
      }

      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("trainingId", trainingId);
        formData.append("kind", kind);
        formData.append("file", file);

        const response = await fetch("/api/projects/upload", {
          method: "POST",
          body: formData,
        });

        const payload = (await response.json()) as {
          url?: string;
          size?: number;
          message?: string;
        };

        if (!response.ok || !payload.url || payload.size === undefined) {
          toast.error(payload.message ?? "Gagal mengunggah file.");
          return;
        }

        setLocalFileName(file.name);
        toast.success("File berhasil diunggah.");
        onUploaded({ url: payload.url, size: payload.size, fileName: file.name });
      } catch {
        toast.error("Gagal mengunggah file.");
      } finally {
        setUploading(false);
      }
    },
    [kind, onUploaded, trainingId],
  );

  const allowedTypes = [...getProjectAllowedMimeTypes(kind)];
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: disabled || uploading || Boolean(uploadedFileName),
    maxFiles: 1,
    accept: Object.fromEntries(allowedTypes.map((type) => [type, []])),
  });

  const hint =
    kind === "pdf"
      ? `PDF · max ${formatProjectMaxFileSize(kind)}`
      : HINTS[kind];

  const displayName = uploadedFileName ?? localFileName;

  if (displayName) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <IconCheck className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground">File berhasil diunggah</p>
          </div>
        </div>
        {onClear ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setLocalFileName(null);
              onClear();
            }}
          >
            <IconX className="size-4" />
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-center transition-colors",
        isDragActive && "border-primary bg-primary/5",
        (disabled || uploading) && "cursor-not-allowed opacity-60",
      )}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <Spinner className="size-6 shrink-0" />
      ) : (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
          <IconUpload className="size-5 text-muted-foreground" />
        </span>
      )}
      <div className="space-y-1">
        <p className="text-sm font-medium">
          {isDragActive ? "Lepaskan file di sini" : "Klik atau seret file"}
        </p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}
