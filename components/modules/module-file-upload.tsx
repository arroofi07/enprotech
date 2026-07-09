"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { IconUpload } from "@tabler/icons-react";

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
  onUploaded: (result: { url: string; size: number }) => void;
  disabled?: boolean;
};

export function ModuleFileUpload({
  purpose,
  onUploaded,
  disabled = false,
}: ModuleFileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

        onUploaded({ url: payload.url, size: payload.size });
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
    disabled: disabled || uploading,
    maxFiles: 1,
    accept: Object.fromEntries(allowedTypes.map((type) => [type, []])),
  });

  const label =
    purpose === "thumbnail"
      ? `Gambar (max ${formatMaxFileSize(purpose)})`
      : `Dokumen PDF/DOC/DOCX/XLS/XLSX (max ${formatMaxFileSize(purpose)})`;

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center transition-colors",
          isDragActive && "border-primary bg-primary/5",
          (disabled || uploading) && "cursor-not-allowed opacity-60",
        )}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <Spinner className="size-6" />
        ) : (
          <IconUpload className="size-6 text-muted-foreground" />
        )}
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {isDragActive ? "Lepaskan file di sini" : "Seret & lepas atau klik untuk upload"}
          </p>
          <p className="text-xs text-muted-foreground">{label}</p>
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
