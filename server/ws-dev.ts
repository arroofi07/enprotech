import { createServer } from "node:http";

import { attachCommunityWebSocket } from "./community-ws";

const port = Number(process.env.COMMUNITY_WS_PORT ?? 3001);
const hostname = process.env.HOSTNAME ?? "0.0.0.0";

const server = createServer((_req, res) => {
  res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
  res.end("community websocket");
});

attachCommunityWebSocket(server);

server.listen(port, hostname, () => {
  console.log(`[community-ws] listening on ${hostname}:${port}`);
});
