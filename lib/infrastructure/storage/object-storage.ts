import { PutObjectCommand } from "@aws-sdk/client-s3";

import type { UploadPurpose } from "@/lib/domain/modules/types";

import { createStorageClient } from "./s3-client";

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
  return process.env.S3_BUCKET ?? DEFAULT_BUCKET;
}

// Base URL yang menghadap browser untuk file publik. Berbeda dari S3_ENDPOINT
// karena upload memakai hostname internal (mis. http://rustfs:9000) sedangkan
// URL yang disimpan & disajikan harus reachable dari luar container.
function getPublicBase(): string {
  const base = process.env.S3_PUBLIC_URL ?? process.env.S3_ENDPOINT ?? "";
  return base.replace(/\/$/, "");
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
  const s3 = createStorageClient();
  const bucket = getStorageBucket();
  const path = buildStoragePath(input);

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: path,
      Body: input.data,
      ContentType: input.contentType,
    }),
  );

  return {
    url: `${getPublicBase()}/${bucket}/${path}`,
    size: input.data.byteLength,
  };
}
