"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { IconCheck, IconUpload, IconX } from "@tabler/icons-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  formatMaxFileSize,
  getAllowedMimeTypes,
} from "@/lib/domain/modules/file-validation";
import type { UploadPurpose } from "@/lib/domain/modules/types";
import { cn } from "@/lib/utils";

type ModuleFileUploadProps = {
  purpose: UploadPurpose;
  onUploaded: (result: { url: string; size: number; fileName: string }) => void;
  onClear?: () => void;
  uploadedFileName?: string;
  disabled?: boolean;
  variant?: "default" | "compact";
};

export function ModuleFileUpload({
  purpose,
  onUploaded,
  onClear,
  uploadedFileName,
  disabled = false,
  variant = "default",
}: ModuleFileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localFileName, setLocalFileName] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) {
        return;
      }

      setUploading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("purpose", purpose);
        formData.append("file", file);

        const response = await fetch("/api/modules/upload", {
          method: "POST",
          body: formData,
        });

        const payload = (await response.json()) as {
          url?: string;
          size?: number;
          message?: string;
        };

        if (!response.ok || !payload.url || payload.size === undefined) {
          setError(payload.message ?? "Gagal mengunggah file.");
          return;
        }

        setLocalFileName(file.name);
        onUploaded({ url: payload.url, size: payload.size, fileName: file.name });
      } catch {
        setError("Gagal mengunggah file.");
      } finally {
        setUploading(false);
      }
    },
    [onUploaded, purpose],
  );

  const allowedTypes = [...getAllowedMimeTypes(purpose)];
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: disabled || uploading || Boolean(uploadedFileName),
    maxFiles: 1,
    accept: Object.fromEntries(allowedTypes.map((type) => [type, []])),
  });

  const hint =
    purpose === "thumbnail"
      ? "JPG, JPEG, PNG, WEBP · max 1 MB"
      : `PDF, DOC/DOCX, XLS/XLSX · max ${formatMaxFileSize(purpose)}`;

  const displayName = uploadedFileName ?? localFileName;

  if (displayName) {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2.5",
          variant === "compact" && "min-h-11",
        )}
      >
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
              setError(null);
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
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer items-center gap-3 rounded-lg border border-dashed text-left transition-colors",
          variant === "compact" ? "px-3 py-2.5" : "flex-col justify-center p-6 text-center",
          isDragActive && "border-primary bg-primary/5",
          (disabled || uploading) && "cursor-not-allowed opacity-60",
        )}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <Spinner className={cn("shrink-0", variant === "compact" ? "size-5" : "size-6")} />
        ) : (
          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-md bg-muted",
              variant === "compact" ? "size-9" : "size-10",
            )}
          >
            <IconUpload
              className={cn(
                "text-muted-foreground",
                variant === "compact" ? "size-4" : "size-5",
              )}
            />
          </span>
        )}
        <div className={cn("min-w-0", variant === "default" && "space-y-1 text-center")}>
          <p className="text-sm font-medium">
            {isDragActive ? "Lepaskan file di sini" : "Klik atau seret file"}
          </p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
