# syntax=docker/dockerfile:1

# Base image Bun (konsisten dengan bun.lock + script `bun run`).
FROM oven/bun:1-slim AS base
WORKDIR /app

# ---- deps: install semua dependency (termasuk devDeps utk tooling) ----
FROM base AS deps
COPY package.json bun.lock ./
# Cache mount agar tarball persist antar build; retry karena extract binary besar
# (@img/sharp-libvips-*) kadang gagal transient di build node. `bun pm cache rm`
# saat retry supaya tarball corrupt di cache di-download ulang.
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile \
    || (bun pm cache rm; bun install --frozen-lockfile) \
    || (bun pm cache rm; bun install --frozen-lockfile)

# ---- builder: bangun output standalone Next.js ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Build tidak butuh secret (tak ada akses DB / NEXT_PUBLIC_* saat build).
RUN bun run build

# ---- tooling: image untuk migrate & seed one-off (punya source + drizzle-kit) ----
FROM base AS tooling
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
CMD ["bun", "run", "db:migrate"]

# ---- runner: Next standalone (3000) + community WebSocket sidecar (3001) ----
FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    COMMUNITY_WS_PORT=3001

COPY --from=builder --chown=bun:bun /app/public ./public
COPY --from=builder --chown=bun:bun /app/.next/standalone ./
COPY --from=builder --chown=bun:bun /app/.next/static ./.next/static
# WS hub + application code (imports @/lib from the sidecar process).
COPY --from=builder --chown=bun:bun /app/server ./server
COPY --from=builder --chown=bun:bun /app/lib ./lib
COPY --from=builder --chown=bun:bun /app/tsconfig.json ./tsconfig.json
COPY --from=builder --chown=bun:bun /app/package.json ./package.json
# Full deps so the WS sidecar can resolve drizzle/jose/ws/etc.
COPY --from=deps --chown=bun:bun /app/node_modules ./node_modules

USER bun
EXPOSE 3000 3001
CMD ["bun", "run", "server/start-docker.ts"]
