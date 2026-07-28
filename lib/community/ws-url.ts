/**
 * Resolve the community chat WebSocket URL.
 * - Prefer NEXT_PUBLIC_COMMUNITY_WS_URL when set.
 * - Local `next dev`: Next on :3000 and WS sidecar on :3001.
 * - Production (Docker gateway / Dokploy): same-origin `/api/community/ws` on the
 *   public HTTPS port so Traefik does not need a separate :3001 route.
 */
export function getCommunityWsUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_COMMUNITY_WS_URL?.trim();
  if (fromEnv) {
    return fromEnv;
  }

  if (typeof window === "undefined") {
    return "";
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const { hostname, port, host } = window.location;

  if (process.env.NODE_ENV === "development" && port === "3000") {
    return `${protocol}//${hostname}:3001/api/community/ws`;
  }

  return `${protocol}//${host}/api/community/ws`;
}
