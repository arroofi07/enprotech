/**
 * Resolve the community chat WebSocket URL.
 * - Prefer NEXT_PUBLIC_COMMUNITY_WS_URL when set (e.g. wss://host/ws).
 * - Local Next on port 3000 (dev or Docker) uses the WS sidecar on 3001.
 * - Otherwise same-origin /api/community/ws (needs reverse-proxy Upgrade).
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

  // Dev (`next dev`) and local Docker both serve the app on 3000 with WS on 3001.
  if (port === "3000") {
    return `${protocol}//${hostname}:3001/api/community/ws`;
  }

  return `${protocol}//${host}/api/community/ws`;
}
