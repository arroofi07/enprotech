#!/usr/bin/env bun
/**
 * Production entry for Docker: Next standalone (port 3000) + community
 * WebSocket sidecar (port 3001). Bun's custom Next server hits
 * AsyncLocalStorage gaps, so we keep the working standalone `server.js`.
 */
import { spawn, type ChildProcess } from "node:child_process";

const children: ChildProcess[] = [];

function start(
  command: string,
  args: string[],
  extraEnv: Record<string, string> = {},
) {
  const child = spawn(command, args, {
    stdio: "inherit",
    env: { ...process.env, ...extraEnv },
  });
  children.push(child);
  return child;
}

start("bun", ["server.js"]);
start("bun", ["run", "server/ws-dev.ts"], {
  COMMUNITY_WS_PORT: process.env.COMMUNITY_WS_PORT ?? "3001",
});

function shutdown(signal: NodeJS.Signals) {
  for (const child of children) {
    child.kill(signal);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

for (const child of children) {
  child.on("exit", (code, signal) => {
    for (const other of children) {
      if (other !== child && !other.killed) {
        other.kill("SIGTERM");
      }
    }
    process.exit(code ?? (signal ? 1 : 0));
  });
}
