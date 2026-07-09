import { put } from "@vercel/blob";

import type { UploadPurpose } from "@/lib/domain/modules/types";

export type UploadFileInput = {
  filename: string;
  contentType: string;
  data: Buffer;
  purpose: UploadPurpose;
};

export type UploadFileResult = {
  url: string;
  size: number;
};

export async function uploadFileToBlob(
  input: UploadFileInput,
): Promise<UploadFileResult> {
  const prefix = input.purpose === "thumbnail" ? "thumbnails" : "documents";
  const pathname = `${prefix}/${Date.now()}-${sanitizeFilename(input.filename)}`;

  const blob = await put(pathname, input.data, {
    access: "public",
    contentType: input.contentType,
  });

  return {
    url: blob.url,
    size: input.data.byteLength,
  };
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}
