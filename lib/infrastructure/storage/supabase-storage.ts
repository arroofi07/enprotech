import type { UploadPurpose } from "@/lib/domain/modules/types";
import { createAdminClient } from "@/utils/supabase/admin";

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

const DEFAULT_BUCKET = "uploads";

function getStorageBucket(): string {
  return process.env.SUPABASE_STORAGE_BUCKET ?? DEFAULT_BUCKET;
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function buildStoragePath(input: UploadFileInput): string {
  const prefix = input.purpose === "thumbnail" ? "thumbnails" : "documents";
  return `${prefix}/${Date.now()}-${sanitizeFilename(input.filename)}`;
}

export async function uploadFileToStorage(
  input: UploadFileInput,
): Promise<UploadFileResult> {
  const supabase = createAdminClient();
  const bucket = getStorageBucket();
  const path = buildStoragePath(input);

  const { error } = await supabase.storage.from(bucket).upload(path, input.data, {
    contentType: input.contentType,
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return {
    url: data.publicUrl,
    size: input.data.byteLength,
  };
}
