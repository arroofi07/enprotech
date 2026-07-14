import { S3Client } from "@aws-sdk/client-s3";

export class StorageConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageConfigError";
  }
}

function trimEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function createStorageClient(): S3Client {
  const endpoint = trimEnv(process.env.S3_ENDPOINT);
  const accessKeyId = trimEnv(process.env.S3_ACCESS_KEY_ID);
  const secretAccessKey = trimEnv(process.env.S3_SECRET_ACCESS_KEY);

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
    region: trimEnv(process.env.S3_REGION) ?? "us-east-1",
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true, // wajib untuk rustfs / MinIO (path-style URL)
    // AWS SDK v3 default-nya WHEN_SUPPORTED (CRC32 header). Banyak S3-compatible
    // (RustFS/MinIO/R2) salah-hitung signature → SignatureDoesNotMatch (403).
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
}
