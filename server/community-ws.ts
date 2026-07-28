import type { IncomingMessage, Server as HttpServer } from "node:http";
import { WebSocketServer, type WebSocket } from "ws";

import { sendMessage } from "@/lib/application/community/send-message";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/infrastructure/auth/session-manager";
import { isStudentEnrolledInTraining } from "@/lib/infrastructure/db/repositories/module-repository";
import { subscribeToCommunityMessages } from "@/lib/infrastructure/community/community-events";
import type { SessionUser } from "@/lib/domain/auth/types";
import type { CommunityMessageDto } from "@/lib/domain/community/types";

const WS_PATH = "/api/community/ws";
const RATE_LIMIT_WINDOW_MS = 10_000;
const RATE_LIMIT_MAX = 20;

type ClientState = {
  user: SessionUser;
  trainingId: string | null;
  unsubscribe: (() => void) | null;
};

type ClientMessage =
  | { type: "join"; trainingId: string }
  | { type: "message"; body: string }
  | { type: "ping" };

function getCookie(req: IncomingMessage, name: string): string | null {
  const raw = req.headers.cookie;
  if (!raw) {
    return null;
  }

  for (const part of raw.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) {
      return decodeURIComponent(rest.join("="));
    }
  }

  return null;
}

function sendJson(socket: WebSocket, payload: unknown) {
  if (socket.readyState === socket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
}

function parseClientMessage(raw: string): ClientMessage | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== "object" || !("type" in parsed)) {
    return null;
  }

  const type = (parsed as { type: unknown }).type;
  if (type === "ping") {
    return { type: "ping" };
  }

  if (type === "join") {
    const trainingId = (parsed as { trainingId?: unknown }).trainingId;
    if (typeof trainingId !== "string" || trainingId.length === 0) {
      return null;
    }
    return { type: "join", trainingId };
  }

  if (type === "message") {
    const body = (parsed as { body?: unknown }).body;
    if (typeof body !== "string") {
      return null;
    }
    return { type: "message", body };
  }

  return null;
}

export function attachCommunityWebSocket(server: HttpServer): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });
  const rateBuckets = new Map<string, number[]>();

  function allowSend(userId: string): boolean {
    const now = Date.now();
    const recent = (rateBuckets.get(userId) ?? []).filter(
      (ts) => now - ts < RATE_LIMIT_WINDOW_MS,
    );
    if (recent.length >= RATE_LIMIT_MAX) {
      rateBuckets.set(userId, recent);
      return false;
    }
    recent.push(now);
    rateBuckets.set(userId, recent);
    return true;
  }

  server.on("upgrade", (request, socket, head) => {
    const pathname = request.url
      ? new URL(request.url, "http://localhost").pathname
      : "";

    if (pathname !== WS_PATH) {
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  });

  wss.on("connection", async (socket: WebSocket, request: IncomingMessage) => {
    const token = getCookie(request, SESSION_COOKIE_NAME);
    const user = token ? await verifySessionToken(token) : null;

    if (!user || user.role !== "student" || user.status !== "active") {
      sendJson(socket, {
        type: "error",
        code: "UNAUTHORIZED",
        message: "Sesi tidak valid.",
      });
      socket.close();
      return;
    }

    const state: ClientState = {
      user,
      trainingId: null,
      unsubscribe: null,
    };

    const onRoomMessage = (message: CommunityMessageDto) => {
      sendJson(socket, { type: "message", payload: message });
    };

    socket.on("message", async (data) => {
      const raw = typeof data === "string" ? data : data.toString("utf8");
      const message = parseClientMessage(raw);

      if (!message) {
        sendJson(socket, {
          type: "error",
          code: "VALIDATION_ERROR",
          message: "Pesan WebSocket tidak valid.",
        });
        return;
      }

      if (message.type === "ping") {
        sendJson(socket, { type: "pong" });
        return;
      }

      if (message.type === "join") {
        const enrolled = await isStudentEnrolledInTraining(
          state.user.id,
          message.trainingId,
        );

        if (!enrolled) {
          sendJson(socket, {
            type: "error",
            code: "NOT_ENROLLED",
            message: "Anda belum terdaftar di training ini.",
          });
          return;
        }

        state.unsubscribe?.();
        state.trainingId = message.trainingId;
        state.unsubscribe = await subscribeToCommunityMessages(
          message.trainingId,
          onRoomMessage,
        );

        sendJson(socket, {
          type: "joined",
          trainingId: message.trainingId,
        });
        return;
      }

      if (message.type === "message") {
        if (!state.trainingId) {
          sendJson(socket, {
            type: "error",
            code: "FORBIDDEN",
            message: "Join ruang diskusi terlebih dahulu.",
          });
          return;
        }

        if (!allowSend(state.user.id)) {
          sendJson(socket, {
            type: "error",
            code: "VALIDATION_ERROR",
            message: "Terlalu banyak pesan. Coba lagi sebentar.",
          });
          return;
        }

        const result = await sendMessage(state.user, state.trainingId, {
          body: message.body,
        });

        if (!result.success) {
          sendJson(socket, {
            type: "error",
            code: result.error,
            message: result.message,
          });
        }
        // Successful send is broadcast via NOTIFY → room subscribers (including sender).
      }
    });

    socket.on("close", () => {
      state.unsubscribe?.();
      state.unsubscribe = null;
    });
  });

  return wss;
}

export { WS_PATH };
