import { spawn } from "node:child_process";

const children = [
  spawn("bun", ["run", "dev:next"], {
    stdio: "inherit",
    env: process.env,
  }),
  spawn("bun", ["run", "dev:ws"], {
    stdio: "inherit",
    env: {
      ...process.env,
      COMMUNITY_WS_PORT: process.env.COMMUNITY_WS_PORT ?? "3001",
    },
  }),
];

function shutdown(signal: NodeJS.Signals) {
  for (const child of children) {
    child.kill(signal);
  }
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

for (const child of children) {
  child.on("exit", (code) => {
    for (const other of children) {
      if (other !== child) {
        other.kill("SIGTERM");
      }
    }
    process.exit(code ?? 1);
  });
}
