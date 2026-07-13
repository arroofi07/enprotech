import { S3Client } from "@aws-sdk/client-s3";

export class StorageConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageConfigError";
  }
}

export function createStorageClient(): S3Client {
  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

  if (!endpoint) {
    throw new StorageConfigError("S3_ENDPOINT belum dikonfigurasi.");
  }

  if (!accessKeyId || !secretAccessKey) {
    throw new StorageConfigError(
      "S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY belum dikonfigurasi.",
    );
  }

  return new S3Client({
    endpoint,
    region: process.env.S3_REGION ?? "us-east-1",
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true, // wajib untuk rustfs / MinIO (path-style URL)
  });
}
