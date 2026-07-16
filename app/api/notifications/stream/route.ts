import { getCurrentUser } from "@/lib/application/auth/get-session";
import { subscribeToNotifications } from "@/lib/infrastructure/notifications/notification-events";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Proxies and browsers drop an idle connection well before this, so a comment
 * line goes out on an interval to keep the stream warm.
 */
const HEARTBEAT_MS = 25_000;

/**
 * Server-sent events telling the client "you have something new, refetch".
 * The payload deliberately carries no notification data: the client already
 * has GET /api/notifications for that, and keeping this a pure signal means
 * authorization stays in one place.
 */
export async function GET(request: Request) {
  const actor = await getCurrentUser();

  if (!actor) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | undefined;
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (chunk: string) => {
        if (closed) {
          return;
        }

        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          // Client vanished between the abort event and this write.
          cleanup();
        }
      };

      const cleanup = () => {
        if (closed) {
          return;
        }
        closed = true;

        unsubscribe?.();
        if (heartbeat) {
          clearInterval(heartbeat);
        }

        try {
          controller.close();
        } catch {
          // Already closed by the runtime.
        }
      };

      request.signal.addEventListener("abort", cleanup);

      try {
        unsubscribe = await subscribeToNotifications(actor.id, () => {
          send("event: notification\ndata: {}\n\n");
        });
      } catch (error) {
        // Without a listener the stream would be a silent lie — close it so the
        // client falls back to polling instead of trusting a dead connection.
        console.error("[notifications] gagal LISTEN, stream ditutup", error);
        cleanup();
        return;
      }

      // The abort may have landed while we were subscribing.
      if (request.signal.aborted) {
        cleanup();
        return;
      }

      send("event: ready\ndata: {}\n\n");
      heartbeat = setInterval(() => send(": ping\n\n"), HEARTBEAT_MS);
    },
    cancel() {
      closed = true;
      unsubscribe?.();
      if (heartbeat) {
        clearInterval(heartbeat);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // Stops Nginx-style reverse proxies from buffering the stream, which
      // would defeat the whole point.
      "X-Accel-Buffering": "no",
    },
  });
}
