#!/usr/bin/env bun
/**
 * Production gateway for Docker / Dokploy:
 * - Public port (PORT, default 3000): HTTP reverse-proxy + community WebSocket
 * - Next standalone listens on an internal port only (NEXT_INTERNAL_PORT, 3002)
 *
 * Why: Dokploy exposes a single HTTPS port. A sidecar on :3001 is not reachable
 * from the browser at wss://domain/api/community/ws, so chat fails in production.
 * Terminating WS on the same public port fixes same-origin chat without Traefik path rules.
 */
import { spawn, type ChildProcess } from "node:child_process";
import {
  createServer,
  request as httpRequest,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { connect as netConnect } from "node:net";

import { attachCommunityWebSocket } from "./community-ws";

const PUBLIC_HOST = process.env.HOSTNAME ?? "0.0.0.0";
const PUBLIC_PORT = Number(process.env.PORT ?? 3000);
const NEXT_HOST = "127.0.0.1";
const NEXT_PORT = Number(process.env.NEXT_INTERNAL_PORT ?? 3002);

const children: ChildProcess[] = [];

function startNext(): ChildProcess {
  const child = spawn("bun", ["server.js"], {
    stdio: "inherit",
    env: {
      ...process.env,
      PORT: String(NEXT_PORT),
      HOSTNAME: NEXT_HOST,
    },
  });
  children.push(child);
  return child;
}

function isNextListening(): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = netConnect({ host: NEXT_HOST, port: NEXT_PORT }, () => {
      socket.end();
      resolve(true);
    });
    socket.on("error", () => resolve(false));
  });
}

async function waitForNext(timeoutMs = 60_000): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await isNextListening()) {
      return;
    }
    await Bun.sleep(200);
  }
  console.warn(
    "[gateway] Next belum siap setelah menunggu; proxy tetap dijalankan",
  );
}

function proxyHttp(req: IncomingMessage, res: ServerResponse) {
  const proxyReq = httpRequest(
    {
      hostname: NEXT_HOST,
      port: NEXT_PORT,
      path: req.url,
      method: req.method,
      headers: req.headers,
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
      proxyRes.pipe(res);
    },
  );

  proxyReq.on("error", (error) => {
    console.error("[gateway] upstream error", error);
    if (!res.headersSent) {
      res.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
    }
    res.end("Bad Gateway");
  });

  req.pipe(proxyReq);
}

const nextChild = startNext();

nextChild.on("exit", (code, signal) => {
  console.error("[gateway] proses Next keluar", { code, signal });
  for (const other of children) {
    if (other !== nextChild && !other.killed) {
      other.kill("SIGTERM");
    }
  }
  process.exit(code ?? 1);
});

await waitForNext();

const server = createServer((req, res) => {
  proxyHttp(req, res);
});

attachCommunityWebSocket(server);

server.listen(PUBLIC_PORT, PUBLIC_HOST, () => {
  console.log(
    `[gateway] :${PUBLIC_PORT} → Next ${NEXT_HOST}:${NEXT_PORT} + WS /api/community/ws`,
  );
});

function shutdown(signal: NodeJS.Signals) {
  server.close();
  for (const child of children) {
    child.kill(signal);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
