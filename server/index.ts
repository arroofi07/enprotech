import { createServer } from "node:http";
import { parse } from "node:url";

import next from "next";

import { attachCommunityWebSocket } from "./community-ws";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME ?? "0.0.0.0";
const port = Number(process.env.PORT ?? 3000);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

await app.prepare();

const server = createServer((req, res) => {
  const parsedUrl = parse(req.url ?? "/", true);
  handle(req, res, parsedUrl);
});

attachCommunityWebSocket(server);

server.listen(port, hostname, () => {
  console.log(`[server] ready on http://${hostname}:${port}`);
});
