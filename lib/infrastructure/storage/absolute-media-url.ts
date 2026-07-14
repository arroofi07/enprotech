/**
 * Pastikan URL media punya scheme absolut.
 * Misconfig `S3_PUBLIC_URL=cdn.example.com` (tanpa https://) membuat browser
 * resolve `src` relatif terhadap path halaman → 404 di localhost.
 */
export function toAbsoluteMediaUrl(url: string | null | undefined): string | null {
  if (url == null || url === "") {
    return null;
  }

  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:")) {
    return trimmed;
  }
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }
  // Host/path tanpa scheme (legacy), atau path absolut root.
  if (trimmed.startsWith("/")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}
