#!/usr/bin/env bun
/**
 * Production entry: Next standalone HTTP server + community WebSocket on the
 * same port. We load the generated standalone server module, then attach WS
 * upgrade handling before listen completes.
 *
 * Fallback: if standalone wiring fails, prefer `bun run server/index.ts`
 * (custom Next server) during local prod testing.
 */
import { createServer } from "node:http";
import { parse } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";

import next from "next";

import { attachCommunityWebSocket } from "./community-ws";

const hostname = process.env.HOSTNAME ?? "0.0.0.0";
const port = Number(process.env.PORT ?? 3000);
const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const app = next({
  dev: false,
  hostname,
  port,
  dir,
});
const handle = app.getRequestHandler();

await app.prepare();

const server = createServer((req, res) => {
  handle(req, res, parse(req.url ?? "/", true));
});

attachCommunityWebSocket(server);

server.listen(port, hostname, () => {
  console.log(`[server] production ready on http://${hostname}:${port}`);
});
