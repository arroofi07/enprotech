export function isDatabaseConnectionError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as {
    code?: string;
    errno?: string;
    cause?: { code?: string; errno?: string };
  };

  const codes = [
    candidate.code,
    candidate.errno,
    candidate.cause?.code,
    candidate.cause?.errno,
  ].filter(Boolean);

  return codes.some((code) =>
    [
      "CONNECT_TIMEOUT",
      "CONNECTION_TIMEOUT",
      "ECONNREFUSED",
      "ECONNRESET",
      "ETIMEDOUT",
      "EHOSTUNREACH",
      "ENOTFOUND",
    ].includes(code as string),
  );
}
